import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box } from "@mui/material";
import {
  useDeleteMyAvailability,
  useMyAvailability,
  useMyCalendar,
  useSetMyAvailabilityRange,
} from "../../hooks/useAvailability";
import { useMyAssignments } from "../../hooks/useReferees";
import { ConfirmDialog, LoadingSpinner } from "../../components/ui";
import {
  AvailabilityCalendar,
  AvailabilityHeader,
  AvailabilityPeriodsSection,
  AvailabilityRequestDialog,
} from "../../components/referee/availability";
import {
  buildAvailabilityCalendarGrid,
  countApprovedUnavailableDays,
  countMatchDaysInMonth,
  filterVisibleAvailabilityPeriods,
  formatDateConflictMessage,
  getDateKey,
  getDateRangeConflicts,
  getMatchDateKey,
  groupAvailabilityPeriods,
  normalizeDateKey,
} from "../../components/referee/availability/availabilityUtils";
import {
  availabilityRequestDefaultValues,
  createAvailabilityRequestSchema,
} from "../../validations/availabilitySchema";

const AvailabilityPage = () => {
  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState(null);
  const assignmentQueryParams = useMemo(
    () => ({ limit: 1000, dateFrom: todayKey }),
    [todayKey],
  );
  const { data: assignmentsData } = useMyAssignments(assignmentQueryParams);

  const acceptedMatchDateSet = useMemo(() => {
    const dates = new Set();
    (assignmentsData?.data || []).forEach((assignment) => {
      const dateKey = getMatchDateKey(assignment, ["accepted"]);
      if (dateKey) dates.add(dateKey);
    });
    return dates;
  }, [assignmentsData?.data]);

  const acceptedMatchDateKeys = useMemo(
    () => Array.from(acceptedMatchDateSet).sort(),
    [acceptedMatchDateSet],
  );

  const availabilityRequestSchema = useMemo(
    () => createAvailabilityRequestSchema(todayKey, acceptedMatchDateKeys),
    [acceptedMatchDateKeys, todayKey],
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(availabilityRequestSchema),
    defaultValues: availabilityRequestDefaultValues,
  });
  const dateFromValue = watch("dateFrom");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    isFetching: isCalendarFetching,
    error: calendarError,
  } = useMyCalendar({ year, month });
  const {
    data: availabilityData,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
  } = useMyAvailability({ limit: 365, dateFrom: todayKey });
  const setAvailabilityRange = useSetMyAvailabilityRange();
  const deleteAvailability = useDeleteMyAvailability();

  const calendar = useMemo(() => {
    const payload = calendarData?.data || calendarData;
    const isCurrentMonth =
      Number(payload?.year) === year && Number(payload?.month) === month;

    return isCurrentMonth ? payload?.calendar || [] : [];
  }, [calendarData, month, year]);
  const availabilityRows = useMemo(
    () => availabilityData?.data || [],
    [availabilityData],
  );
  const periods = useMemo(() => {
    const groupedPeriods = groupAvailabilityPeriods(availabilityRows);
    return filterVisibleAvailabilityPeriods(groupedPeriods, todayKey);
  }, [availabilityRows, todayKey]);

  const calendarByDate = useMemo(() => {
    const map = new Map();
    calendar.forEach((item) => {
      map.set(normalizeDateKey(item.date), item);
    });
    return map;
  }, [calendar]);

  const matchDateSet = useMemo(() => {
    const dates = new Set();
    (assignmentsData?.data || []).forEach((assignment) => {
      const dateKey = getMatchDateKey(assignment, ["accepted"]);
      if (dateKey) dates.add(dateKey);
    });
    return dates;
  }, [assignmentsData?.data]);

  const calendarGrid = useMemo(
    () =>
      buildAvailabilityCalendarGrid({
        year,
        month,
        todayKey,
        calendarByDate,
        matchDateSet,
      }),
    [calendarByDate, matchDateSet, month, todayKey, year],
  );

  const approvedUnavailableDays = useMemo(
    () => countApprovedUnavailableDays(calendar),
    [calendar],
  );

  const matchDaysThisMonth = useMemo(
    () => countMatchDaysInMonth(matchDateSet, year, month),
    [matchDateSet, month, year],
  );

  const handleOpenDialog = () => {
    reset(availabilityRequestDefaultValues);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (setAvailabilityRange.isPending) return;
    setDialogOpen(false);
  };

  const handleDateFromChange = (value) => {
    setValue("dateFrom", value, { shouldDirty: true, shouldValidate: true });
    const currentDateTo = watch("dateTo");
    if (currentDateTo && value && currentDateTo < value) {
      setValue("dateTo", value, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleFormSubmit = async (values) => {
    const acceptedMatchConflicts = getDateRangeConflicts(
      values.dateFrom,
      values.dateTo,
      acceptedMatchDateSet,
    );

    if (acceptedMatchConflicts.length > 0) {
      setError("dateTo", {
        type: "manual",
        message: formatDateConflictMessage(acceptedMatchConflicts),
      });
      return;
    }

    try {
      await setAvailabilityRange.mutateAsync({
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
        isAvailable: false,
        reason: values.reason,
        description: values.description?.trim() || null,
      });
      setDialogOpen(false);
      reset(availabilityRequestDefaultValues);
    } catch {
      // React Query hook handles the API error toast.
    }
  };

  const handleOpenDeleteConfirm = (period) => {
    setPeriodToDelete(period);
  };

  const handleCloseDeleteConfirm = () => {
    if (deleteAvailability.isPending) return;
    setPeriodToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!periodToDelete) return;

    try {
      await deleteAvailability.mutateAsync(periodToDelete.ids);
    } catch {
      // The mutation hook shows the API error toast.
    } finally {
      setPeriodToDelete(null);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isInitialLoading =
    (isCalendarLoading && !calendarData) ||
    (isAvailabilityLoading && !availabilityData);
  const error = calendarError || availabilityError;

  if (isInitialLoading) return <LoadingSpinner fullPage />;

  if (error && !calendarData && !availabilityData) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity='error'>
          Failed to load availability data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Failed to refresh availability data: {error.message}
        </Alert>
      )}

      <AvailabilityHeader onReport={handleOpenDialog} />

      <AvailabilityPeriodsSection
        periods={periods}
        onDelete={handleOpenDeleteConfirm}
      />

      <AvailabilityCalendar
        year={year}
        month={month}
        calendarGrid={calendarGrid}
        approvedUnavailableDays={approvedUnavailableDays}
        matchDaysThisMonth={matchDaysThisMonth}
        isUpdating={isCalendarFetching && !isCalendarLoading}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      <AvailabilityRequestDialog
        open={dialogOpen}
        control={control}
        errors={errors}
        todayKey={todayKey}
        dateFromValue={dateFromValue}
        isSubmitting={setAvailabilityRange.isPending}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit(handleFormSubmit)}
        onDateFromChange={handleDateFromChange}
      />

      <ConfirmDialog
        open={!!periodToDelete}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title='Delete Availability Request'
        message='Are you sure you want to delete this availability request?'
        confirmText='Delete'
        loading={deleteAvailability.isPending}
      />
    </Box>
  );
};

export default AvailabilityPage;
