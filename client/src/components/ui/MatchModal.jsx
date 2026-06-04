import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  useTeams,
  useVenues,
  useCompetitions,
  useUserStatistics,
} from "../../hooks";
import { Controller, useForm } from "react-hook-form";
import CustomSelect from "./CustomSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMatchSchema } from "../../validations/matchSchema";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { useAuth } from "../../context";
import { CancelMatchDialog, PostponeMatchDialog } from "./match";

const getTodayDateValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const MatchModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editMatch = null,
}) => {
  const { user } = useAuth();
  const canChangeDelegate = user?.role === "admin";
  const { data: teamsData } = useTeams({ limit: 100 });
  const { data: venuesData } = useVenues({ limit: 100 });
  const { data: competitionsData } = useCompetitions({ limit: 100 });
  const { data: delegatesData } = useUserStatistics({
    enabled: canChangeDelegate,
  });
  const teams = useMemo(() => teamsData?.data || [], [teamsData?.data]);
  const venues = useMemo(() => venuesData?.data || [], [venuesData?.data]);
  const competitionRows = useMemo(
    () => competitionsData?.data || [],
    [competitionsData?.data],
  );
  const [statusAction, setStatusAction] = useState(null);
  const venueManuallyChangedRef = useRef(false);
  const lastAutoVenueIdRef = useRef("");
  const schema = useMemo(
    () =>
      createMatchSchema({
        requireDelegate: canChangeDelegate,
        competitions: competitionRows,
      }),
    [canChangeDelegate, competitionRows],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      competitionId: "",
      homeTeamId: "",
      awayTeamId: "",
      venueId: "",
      round: "",
      date: "",
      time: "",
      notes: "",
      delegateId: "",
    },
  });

  const competitions = useMemo(
    () =>
      competitionRows.map((competition) => ({
        label: competition.season
          ? `${competition.name} · ${competition.season}`
          : competition.name,
        value: competition.id,
      })),
    [competitionRows],
  );
  const delegates = useMemo(
    () =>
      (delegatesData?.data?.activeDelegatesData || []).map((delegate) => ({
        label: `${delegate.firstName} ${delegate.lastName}`,
        value: delegate.id,
      })),
    [delegatesData?.data?.activeDelegatesData],
  );
  const venueOptions = useMemo(
    () => venues.map((venue) => ({ label: venue.name, value: venue.id })),
    [venues],
  );

  const homeTeamId = watch("homeTeamId");
  const awayTeamId = watch("awayTeamId");
  const competitionId = watch("competitionId");
  const todayDate = getTodayDateValue();
  const selectedCompetition = useMemo(
    () =>
      competitionRows.find((competition) => competition.id === competitionId),
    [competitionId, competitionRows],
  );
  const minMatchDate = useMemo(() => {
    if (selectedCompetition?.startDate > todayDate) {
      return selectedCompetition.startDate;
    }

    return todayDate;
  }, [selectedCompetition?.startDate, todayDate]);
  const getPrimaryVenueId = useCallback(
    (teamId) => teams.find((team) => team.id === teamId)?.primaryVenueId || "",
    [teams],
  );
  const homeTeamOptions = useMemo(
    () =>
      teams
        .filter((team) => team.id !== awayTeamId)
        .map((team) => ({ label: team.name, value: team.id })),
    [awayTeamId, teams],
  );
  const awayTeamOptions = useMemo(
    () =>
      teams
        .filter((team) => team.id !== homeTeamId)
        .map((team) => ({ label: team.name, value: team.id })),
    [homeTeamId, teams],
  );

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editMatch) {
        const matchDate = editMatch.scheduledAt
          ? new Date(editMatch.scheduledAt)
          : null;
        reset({
          id: editMatch.id || "",
          competitionId: editMatch.competitionId || "",
          homeTeamId: editMatch.homeTeam?.id || editMatch.homeTeamId || "",
          awayTeamId: editMatch.awayTeam?.id || editMatch.awayTeamId || "",
          venueId: editMatch.venueId || "",
          round: editMatch.round ? String(editMatch.round) : "",
          date: matchDate ? matchDate.toISOString().split("T")[0] : "",
          time: matchDate ? matchDate.toTimeString().substring(0, 5) : "",
          notes: editMatch.notes || "",
          delegateId: editMatch.delegate?.id || editMatch.delegateId || "",
        });
        venueManuallyChangedRef.current = false;
        lastAutoVenueIdRef.current = editMatch.venueId || "";
        setStatusAction(null);
      } else {
        reset({
          id: "",
          competitionId: "",
          homeTeamId: "",
          awayTeamId: "",
          venueId: "",
          round: "",
          date: "",
          time: "",
          notes: "",
          delegateId: "",
        });
        venueManuallyChangedRef.current = false;
        lastAutoVenueIdRef.current = "";
        setStatusAction(null);
      }
    }
  }, [editMatch, open, reset]);

  const handleHomeTeamChange = (field) => (event) => {
    field.onChange(event);

    const primaryVenueId = getPrimaryVenueId(event.target.value);
    const currentVenueId = getValues("venueId");

    if (
      !venueManuallyChangedRef.current ||
      !currentVenueId ||
      currentVenueId === lastAutoVenueIdRef.current
    ) {
      setValue("venueId", primaryVenueId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      lastAutoVenueIdRef.current = primaryVenueId;
      venueManuallyChangedRef.current = false;
    }
  };

  const handleVenueChange = (field) => (event) => {
    field.onChange(event);
    venueManuallyChangedRef.current =
      event.target.value !== lastAutoVenueIdRef.current;
  };

  const onFormSubmit = (data) => {
    const { date, time, delegateId, ...rest } = data;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onSubmit({
      ...rest,
      ...(canChangeDelegate && delegateId ? { delegateId } : {}),
      scheduledAt,
    });
  };

  const handleStatusSubmit = async (payload) => {
    await onSubmit(payload);
    setStatusAction(null);
  };

  const canChangeMatchStatus =
    editMatch && !["completed", "cancelled"].includes(editMatch.status);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: { xs: "flex-end", sm: "center" },
        justifyContent: "center",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.8)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          bgcolor: "#121214",
          borderRadius: "16px",
          border: "1px solid #242428",
          width: "100%",
          maxWidth: 700,
          maxHeight: { xs: "calc(100dvh - 16px)", sm: "90vh" },
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "#121214",
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            {editMatch ? "Edit Match" : "New Match"}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: "#6b7280", "&:hover": { bgcolor: "#242428" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: canChangeDelegate ? "1fr 1fr" : "1fr",
              },
              gap: 2,
            }}
          >
            <Controller
              name='competitionId'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label='Competition *'
                  placeholder='Select competition'
                  options={competitions}
                  error={errors.competitionId?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name='round'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Round *'
                  placeholder='Enter round'
                  error={errors?.round?.message}
                />
              )}
            />
          </Box>

          {/* Teams */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Controller
              name='homeTeamId'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label='Home Team *'
                  placeholder='Select home team'
                  options={homeTeamOptions}
                  error={errors.homeTeamId?.message}
                  {...field}
                  onChange={handleHomeTeamChange(field)}
                />
              )}
            />
            <Controller
              name='awayTeamId'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label='Away Team *'
                  placeholder='Select away team'
                  options={awayTeamOptions}
                  error={errors.awayTeamId?.message}
                  {...field}
                />
              )}
            />
          </Box>

          {/* Venue and Date/Time */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Controller
              name='date'
              control={control}
              render={({ field }) => (
                <CustomInput
                  type='date'
                  label='Date *'
                  error={errors.date?.message}
                  {...field}
                  sx={{
                    "& input::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                    },
                  }}
                  slotProps={{
                    htmlInput: {
                      min: minMatchDate,
                      max: selectedCompetition?.endDate || undefined,
                    },
                  }}
                />
              )}
            />
            <Controller
              name='time'
              control={control}
              render={({ field }) => (
                <CustomInput
                  type='time'
                  label='Time *'
                  error={errors.time?.message}
                  {...field}
                  sx={{
                    "& input::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Controller
              name='venueId'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label='Venue *'
                  placeholder='Select venue'
                  options={venueOptions}
                  error={errors.venueId?.message}
                  {...field}
                  onChange={handleVenueChange(field)}
                />
              )}
            />
            {canChangeDelegate && (
              <Controller
                name='delegateId'
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label='Delegate *'
                    placeholder='Select delegate'
                    options={delegates}
                    error={errors.delegateId?.message}
                    {...field}
                  />
                )}
              />
            )}
          </Box>

          {/* Notes */}
          <Controller
            name='notes'
            control={control}
            render={({ field }) => (
              <CustomInput
                label='Notes'
                placeholder='Additional notes about the match...'
                multiline
                rows={3}
                error={errors.notes?.message}
                {...field}
              />
            )}
          />

          {canChangeMatchStatus && (
            <Box
              sx={{
                border: "1px solid #242428",
                borderRadius: "14px",
                p: { xs: 1.5, sm: 2 },
                display: "grid",
                gap: 1.5,
                bgcolor: "#0d0d0f",
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
                Match status
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1,
                }}
              >
                <Button
                  onClick={() => setStatusAction("cancelled")}
                  sx={statusButtonSx("cancelled")}
                >
                  Cancel Match
                </Button>
                <Button
                  onClick={() => setStatusAction("postponed")}
                  sx={statusButtonSx("postponed")}
                >
                  Postpone Match
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "#121214",
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1.5,
            zIndex: 10,
          }}
        >
          <CustomButton
            variant='outline'
            onClick={onClose}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit(onFormSubmit)}
            loading={isLoading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {editMatch ? "Update Match" : "Create Match"}
          </CustomButton>
        </Box>
      </Box>

      {statusAction && (
        <>
          <CancelMatchDialog
            open={statusAction === "cancelled"}
            isLoading={isLoading}
            onClose={() => setStatusAction(null)}
            onSubmit={handleStatusSubmit}
          />
          <PostponeMatchDialog
            open={statusAction === "postponed"}
            editMatch={editMatch}
            isLoading={isLoading}
            onClose={() => setStatusAction(null)}
            onSubmit={handleStatusSubmit}
          />
        </>
      )}
    </Box>
  );
};

const statusButtonSx = (action) => {
  const isCancel = action === "cancelled";
  const color = isCancel ? "#ef4444" : "#38bdf8";

  return {
    color,
    bgcolor: isCancel ? "rgba(239,68,68,0.08)" : "rgba(56,189,248,0.08)",
    border: `1px solid ${isCancel ? "rgba(239,68,68,0.28)" : "rgba(56,189,248,0.28)"}`,
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 700,
    minHeight: 46,
    "&:hover": {
      bgcolor: isCancel ? "rgba(239,68,68,0.18)" : "rgba(56,189,248,0.18)",
    },
  };
};

export default MatchModal;
