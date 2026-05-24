import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  SportsBasketball as SportsBasketballIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import {
  useDeleteMyAvailability,
  useMyAvailability,
  useMyCalendar,
  useSetMyAvailabilityRange,
} from "../../hooks/useAvailability";
import { useMyAssignments } from "../../hooks/useReferees";
import {
  ConfirmDialog,
  DeleteButton,
  FormValidationError,
} from "../../components/ui";
import {
  MONTH_NAMES,
  WEEKDAY_SHORT_NAMES_MONDAY_FIRST,
} from "../../constants/date";

const UNAVAILABILITY_REASONS = [
  "Annual leave",
  "Illness",
  "Injury",
  "Personal reasons",
  "Business commitments",
  "Other",
];

const STATUS_META = {
  approved: {
    label: "Approved",
    color: "#22c55e",
    icon: CheckCircleIcon,
  },
  pending: {
    label: "Pending approval",
    color: "#f59e0b",
    icon: AccessTimeIcon,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    icon: WarningAmberIcon,
  },
};

const fieldLabelSx = {
  mb: 1,
  color: "#c5cad3",
  fontSize: "14px",
  fontWeight: 700,
};

const createAvailabilityRequestSchema = (todayKey) =>
  z
    .object({
      dateFrom: z.string().min(1, "From date is required."),
      dateTo: z.string().min(1, "To date is required."),
      reason: z.string().min(1, "Reason is required."),
      description: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.dateFrom && data.dateFrom < todayKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateFrom"],
          message: "Choose today or a future date.",
        });
      }

      if (data.dateTo && data.dateTo < todayKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateTo"],
          message: "Choose today or a future date.",
        });
      }

      if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateTo"],
          message: "The end date must be on or after the start date.",
        });
      }
    });

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.split("T")[0];
  return getDateKey(new Date(value));
};

const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

const isNextDate = (previousDateKey, nextDateKey) =>
  getDateKey(addDays(parseDateKey(previousDateKey), 1)) === nextDateKey;

const formatDisplayDate = (dateKey) =>
  parseDateKey(dateKey).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateRange = (startDate, endDate) =>
  startDate === endDate
    ? formatDisplayDate(startDate)
    : `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;

const getMatchDateKey = (assignment) => {
  const match = assignment?.match || assignment?.Match;
  const scheduledAt = match?.scheduledAt || match?.matchDate || match?.date;
  if (
    !scheduledAt ||
    !["pending", "accepted"].includes(assignment?.status)
  ) {
    return null;
  }

  const date = new Date(scheduledAt);
  return Number.isNaN(date.getTime()) ? null : getDateKey(date);
};

const groupAvailabilityPeriods = (rows = []) => {
  const unavailableRows = rows
    .filter((row) => row && row.isAvailable === false)
    .map((row) => ({
      ...row,
      dateKey: normalizeDateKey(row.date),
      approvalStatus: row.approvalStatus || "approved",
      reason: row.reason || "Unavailable",
      description: row.description || "",
    }))
    .filter((row) => row.dateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  return unavailableRows.reduce((periods, row) => {
    const previous = periods[periods.length - 1];
    const canExtend =
      previous &&
      previous.refereeId === row.refereeId &&
      previous.reason === row.reason &&
      previous.description === row.description &&
      previous.approvalStatus === row.approvalStatus &&
      isNextDate(previous.endDate, row.dateKey);

    if (canExtend) {
      previous.endDate = row.dateKey;
      previous.ids.push(row.id);
      previous.items.push(row);
      return periods;
    }

    periods.push({
      key: `${row.id}-${row.dateKey}`,
      refereeId: row.refereeId,
      reason: row.reason,
      description: row.description,
      approvalStatus: row.approvalStatus,
      startDate: row.dateKey,
      endDate: row.dateKey,
      ids: [row.id],
      items: [row],
    });

    return periods;
  }, []);
};

const AvailabilityPage = () => {
  const theme = useTheme();
  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const availabilityRequestSchema = useMemo(
    () => createAvailabilityRequestSchema(todayKey),
    [todayKey],
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState(null);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(availabilityRequestSchema),
    defaultValues: {
      dateFrom: "",
      dateTo: "",
      reason: "",
      description: "",
    },
  });
  const dateFromValue = watch("dateFrom");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useMyCalendar({ year, month });
  const {
    data: availabilityData,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
  } = useMyAvailability({ limit: 365, dateFrom: todayKey });
  const { data: assignmentsData } = useMyAssignments();
  const setAvailabilityRange = useSetMyAvailabilityRange();
  const deleteAvailability = useDeleteMyAvailability();

  const calendar = useMemo(
    () => calendarData?.data?.calendar || calendarData?.calendar || [],
    [calendarData],
  );
  const availabilityRows = useMemo(
    () => availabilityData?.data || [],
    [availabilityData],
  );
  const periods = useMemo(
    () => groupAvailabilityPeriods(availabilityRows),
    [availabilityRows],
  );

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
      const dateKey = getMatchDateKey(assignment);
      if (dateKey) dates.add(dateKey);
    });
    return dates;
  }, [assignmentsData?.data]);

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = addDays(firstDay, -mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      const dateKey = getDateKey(date);
      const availability = calendarByDate.get(dateKey);
      const isCurrentMonth = date.getMonth() === month - 1;
      const hasMatch = matchDateSet.has(dateKey);
      const isApprovedUnavailable =
        availability?.isAvailable === false &&
        availability?.approvalStatus === "approved";

      const status = !isCurrentMonth
        ? "outside"
        : hasMatch
          ? "match"
          : isApprovedUnavailable
            ? "unavailable"
            : "available";

      return {
        dateKey,
        day: date.getDate(),
        isCurrentMonth,
        isToday: dateKey === todayKey,
        status,
        reason: availability?.reason,
      };
    });
  }, [calendarByDate, matchDateSet, month, todayKey, year]);

  const approvedUnavailableDays = useMemo(
    () =>
      calendar.filter(
        (item) =>
          item.isAvailable === false && item.approvalStatus === "approved",
      ).length,
    [calendar],
  );

  const matchDaysThisMonth = useMemo(
    () =>
      Array.from(matchDateSet).filter((dateKey) => {
        const date = parseDateKey(dateKey);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      }).length,
    [matchDateSet, month, year],
  );

  const handleOpenDialog = () => {
    reset({
      dateFrom: "",
      dateTo: "",
      reason: "",
      description: "",
    });
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
    try {
      await setAvailabilityRange.mutateAsync({
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
        isAvailable: false,
        reason: values.reason,
        description: values.description?.trim() || null,
      });
      setDialogOpen(false);
      reset({
        dateFrom: "",
        dateTo: "",
        reason: "",
        description: "",
      });
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
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isLoading = isCalendarLoading || isAvailabilityLoading;
  const error = calendarError || availabilityError;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#22c55e" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity='error'>
          Failed to load availability data: {error.message}
        </Alert>
      </Box>
    );
  }

  const cellStyles = {
    available: {
      color: "#22c55e",
      bgcolor: alpha(theme.palette.success.main, 0.11),
      borderColor: alpha(theme.palette.success.main, 0.38),
    },
    unavailable: {
      color: "#ef4444",
      bgcolor: alpha(theme.palette.error.main, 0.18),
      borderColor: alpha(theme.palette.error.main, 0.48),
    },
    match: {
      color: "#fb923c",
      bgcolor: alpha(theme.palette.warning.main, 0.2),
      borderColor: alpha(theme.palette.warning.main, 0.5),
    },
    outside: {
      color: "#4b5563",
      bgcolor: "transparent",
      borderColor: "transparent",
    },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "34px", sm: "40px", md: "48px" },
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.05,
            }}
          >
            My availability
          </Typography>
          <Typography sx={{ mt: 1, fontSize: "14px", color: "#6b7280" }}>
            Review your unavailable periods and monthly match calendar.
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            px: 2.5,
            py: 1.35,
            borderRadius: "12px",
            bgcolor: "#22c55e",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "none",
            width: { xs: "100%", sm: "auto" },
            "&:hover": { bgcolor: "#16a34a" },
          }}
        >
          Report unavailability
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            mb: 2,
            color: "#fff",
            fontSize: { xs: "22px", md: "26px" },
            fontWeight: 700,
          }}
        >
          Reported unavailable periods
        </Typography>

        {periods.length === 0 ? (
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "16px",
              bgcolor: "#121214",
              border: "1px solid #242428",
              textAlign: "center",
            }}
          >
            <EventAvailableIcon sx={{ color: "#22c55e", fontSize: 36 }} />
            <Typography sx={{ mt: 1, color: "#fff", fontWeight: 600 }}>
              No unavailable periods reported.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {periods.map((period) => {
              const meta =
                STATUS_META[period.approvalStatus] || STATUS_META.pending;
              const StatusIcon = meta.icon;

              return (
                <Paper
                  key={period.key}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: "16px",
                    bgcolor: "#121214",
                    border: "1px solid #242428",
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "14px",
                      bgcolor: alpha(meta.color, 0.15),
                      color: meta.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <StatusIcon />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}
                    >
                      {period.reason}
                    </Typography>
                    <Typography
                      sx={{ mt: 0.25, color: "#6b7280", fontSize: "15px" }}
                    >
                      {formatDateRange(period.startDate, period.endDate)}
                    </Typography>
                    {period.description && (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#9ca3af",
                          fontSize: "14px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {period.description}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      alignSelf: { xs: "stretch", sm: "center" },
                      justifyContent: { xs: "space-between", sm: "flex-end" },
                    }}
                  >
                    <Chip
                      label={meta.label}
                      sx={{
                        bgcolor: alpha(meta.color, 0.15),
                        color: meta.color,
                        fontWeight: 700,
                        borderRadius: "999px",
                      }}
                    />
                    <DeleteButton
                      tooltip='Delete request'
                      onClick={() => handleOpenDeleteConfirm(period)}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: "16px",
          bgcolor: "#121214",
          border: "1px solid #242428",
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box>
            <Typography
              sx={{ color: "#fff", fontSize: "24px", fontWeight: 700 }}
            >
              Availability Calendar - {MONTH_NAMES[month - 1]} {year}
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#6b7280", fontSize: "14px" }}>
              {approvedUnavailableDays} unavailable days, {matchDaysThisMonth}{" "}
              match days
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={goToPreviousMonth} sx={{ color: "#fff" }}>
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Button
              startIcon={<CalendarMonthIcon />}
              onClick={goToToday}
              variant='outlined'
              sx={{
                borderColor: "#3f3f46",
                color: "#22c55e",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Today
            </Button>
            <IconButton onClick={goToNextMonth} sx={{ color: "#fff" }}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: { xs: 0.75, sm: 1.25 },
          }}
        >
          {WEEKDAY_SHORT_NAMES_MONDAY_FIRST.map((day) => (
            <Typography
              key={day}
              sx={{
                py: 1,
                color: "#6b7280",
                textAlign: "center",
                fontWeight: 700,
                fontSize: { xs: "12px", sm: "14px" },
              }}
            >
              {day}
            </Typography>
          ))}

          {calendarGrid.map((dayInfo) => {
            const styles = cellStyles[dayInfo.status];
            const tooltip =
              dayInfo.status === "match"
                ? "Match day"
                : dayInfo.status === "unavailable"
                  ? dayInfo.reason || "Unavailable"
                  : dayInfo.status === "available"
                    ? "Available"
                    : "";

            return (
              <Tooltip
                key={dayInfo.dateKey}
                title={tooltip}
                arrow
                disableHoverListener={!tooltip}
              >
                <Box
                  sx={{
                    minHeight: { xs: 48, sm: 64, md: 72 },
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: styles.borderColor,
                    bgcolor: styles.bgcolor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: styles.color,
                    fontSize: { xs: "15px", sm: "18px" },
                    fontWeight: 800,
                    outline: dayInfo.isToday
                      ? `2px solid ${alpha("#22c55e", 0.75)}`
                      : "none",
                    outlineOffset: "-2px",
                  }}
                >
                  {dayInfo.day}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Box
          sx={{
            mt: 3,
            pt: 2.5,
            borderTop: "1px solid #242428",
            display: "flex",
            gap: { xs: 2, sm: 3 },
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Available", color: "#22c55e", icon: EventAvailableIcon },
            { label: "Unavailable", color: "#ef4444", icon: EventBusyIcon },
            { label: "Match", color: "#fb923c", icon: SportsBasketballIcon },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "6px",
                  bgcolor: alpha(item.color, 0.18),
                  border: `1px solid ${alpha(item.color, 0.55)}`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <item.icon sx={{ fontSize: 14 }} />
              </Box>
              <Typography sx={{ color: "#9ca3af", fontWeight: 600 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth='sm'
        PaperProps={{
          sx: {
            bgcolor: "#121214",
            border: "1px solid #242428",
            borderRadius: "18px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2.5, sm: 3 },
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            component='span'
            sx={{
              color: "#fff",
              fontSize: { xs: "18px", sm: "28px" },
              fontWeight: 600,
            }}
          >
            Report unavailability
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            mt: 3,
            px: { xs: 2.5, sm: 4 },
            pb: { xs: 3, sm: 4 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: 3.25, sm: 3 },
            }}
          >
            <Box>
              <Typography sx={fieldLabelSx}>From date *</Typography>
              <Controller
                name='dateFrom'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type='date'
                    fullWidth
                    error={!!errors.dateFrom}
                    onChange={(event) =>
                      handleDateFromChange(event.target.value)
                    }
                    slotProps={{ htmlInput: { min: todayKey } }}
                  />
                )}
              />
              <FormValidationError>
                {errors.dateFrom?.message}
              </FormValidationError>
            </Box>
            <Box>
              <Typography sx={fieldLabelSx}>To date *</Typography>
              <Controller
                name='dateTo'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type='date'
                    fullWidth
                    error={!!errors.dateTo}
                    slotProps={{
                      htmlInput: { min: dateFromValue || todayKey },
                    }}
                  />
                )}
              />
              <FormValidationError>
                {errors.dateTo?.message}
              </FormValidationError>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography sx={fieldLabelSx}>Reason *</Typography>
            <Controller
              name='reason'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.reason}>
                  <Select
                    {...field}
                    displayEmpty
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <Typography sx={{ color: "#6b7280" }}>
                          Select reason...
                        </Typography>
                      )
                    }
                  >
                    <MenuItem value='' disabled>
                      Select reason...
                    </MenuItem>
                    {UNAVAILABILITY_REASONS.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {reason}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <FormValidationError>{errors.reason?.message}</FormValidationError>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography sx={fieldLabelSx}>Description</Typography>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder='Additional information...'
                  multiline
                  minRows={4}
                  fullWidth
                  error={!!errors.description}
                />
              )}
            />
            <FormValidationError>
              {errors.description?.message}
            </FormValidationError>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2.5, sm: 3 },
            borderTop: "1px solid #242428",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 1.5, sm: 2 },
            "& > :not(style)": {
              width: "100%",
              m: 0,
            },
            "& > :not(style) ~ :not(style)": {
              ml: "0 !important",
            },
          }}
        >
          <Button
            onClick={handleCloseDialog}
            disabled={setAvailabilityRange.isPending}
            sx={{
              py: { xs: 1.25, sm: 1.35 },
              minHeight: { xs: 48, sm: 52 },
              borderRadius: "12px",
              bgcolor: "#242428",
              color: "#fff",
              fontSize: { xs: "14px", sm: "16px" },
              fontWeight: 600,
              "&:hover": { bgcolor: "#2e2e33" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            disabled={setAvailabilityRange.isPending}
            sx={{
              py: { xs: 1.25, sm: 1.35 },
              minHeight: { xs: 48, sm: 52 },
              borderRadius: "12px",
              bgcolor: "#22c55e",
              color: "#fff",
              fontSize: { xs: "14px", sm: "16px" },
              fontWeight: 600,
              "&:hover": { bgcolor: "#16a34a" },
            }}
          >
            {setAvailabilityRange.isPending ? "Submitting..." : "Report"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={!!periodToDelete}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title='Delete Availability Request'
        message={"Are you sure you want to delete this availability request?"}
        confirmText='Delete'
        loading={deleteAvailability.isPending}
      />
    </Box>
  );
};

export default AvailabilityPage;
