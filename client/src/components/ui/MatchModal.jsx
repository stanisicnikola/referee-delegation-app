import { useEffect, useMemo, useState } from "react";
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

const MatchModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editMatch = null,
}) => {
  const { user } = useAuth();
  const canChangeDelegate = user?.role === "admin";
  const [statusAction, setStatusAction] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeTime, setPostponeTime] = useState("");
  const schema = useMemo(
    () => createMatchSchema({ requireDelegate: canChangeDelegate }),
    [canChangeDelegate],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
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

  const { data: teamsData } = useTeams({ limit: 100 });
  const { data: venuesData } = useVenues({ limit: 100 });
  const { data: competitionsData } = useCompetitions({ limit: 100 });
  const { data: delegatesData } = useUserStatistics({
    enabled: canChangeDelegate,
  });

  const teams = teamsData?.data || [];
  const venues = venuesData?.data || [];
  const competitions = (competitionsData?.data || []).map((c) => ({
    label: c.name,
    value: c.id,
  }));
  const delegates = (delegatesData?.data?.activeDelegatesData || []).map(
    (d) => ({
      label: `${d.firstName} ${d.lastName}`,
      value: d.id,
    }),
  );

  const homeTeamId = watch("homeTeamId");
  const awayTeamId = watch("awayTeamId");

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
        setStatusAction(null);
        setStatusReason(editMatch.statusReason || "");
        setPostponeDate(
          matchDate ? matchDate.toISOString().split("T")[0] : "",
        );
        setPostponeTime(
          matchDate ? matchDate.toTimeString().substring(0, 5) : "",
        );
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
        setStatusAction(null);
        setStatusReason("");
        setPostponeDate("");
        setPostponeTime("");
      }
    }
  }, [editMatch, open, reset]);

  const onFormSubmit = (data) => {
    const { date, time, delegateId, ...rest } = data;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onSubmit({
      ...rest,
      ...(canChangeDelegate && delegateId ? { delegateId } : {}),
      scheduledAt,
    });
  };

  const handleStatusAction = async () => {
    const reason = statusReason.trim();
    if (!statusAction || !reason) return;

    if (statusAction === "cancelled") {
      await onSubmit({
        status: "cancelled",
        statusReason: reason,
      });
      return;
    }

    if (statusAction === "postponed") {
      if (!postponeDate || !postponeTime) return;
      await onSubmit({
        status: "postponed",
        statusReason: reason,
        scheduledAt: new Date(`${postponeDate}T${postponeTime}`).toISOString(),
      });
    }
  };

  const canChangeMatchStatus =
    editMatch && !["completed", "cancelled"].includes(editMatch.status);
  const statusActionLabel =
    statusAction === "cancelled"
      ? "Cancel Match"
      : statusAction === "postponed"
        ? "Postpone Match"
        : "";
  const statusActionDisabled =
    isLoading ||
    !statusAction ||
    !statusReason.trim() ||
    (statusAction === "postponed" && (!postponeDate || !postponeTime));

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
          backdropFilter: "blur(4px)",
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
                  options={teams
                    .filter((t) => t.id !== awayTeamId)
                    .map((t) => ({ label: t.name, value: t.id }))}
                  error={errors.homeTeamId?.message}
                  {...field}
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
                  options={teams
                    .filter((t) => t.id !== homeTeamId)
                    .map((t) => ({ label: t.name, value: t.id }))}
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
                  options={venues.map((v) => ({ label: v.name, value: v.id }))}
                  error={errors.venueId?.message}
                  {...field}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                  gap: 1,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box>
                  <Typography
                    sx={{ color: "#fff", fontSize: 15, fontWeight: 700 }}
                  >
                    Match status
                  </Typography>
                  <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.25 }}>
                    Cancel this match or postpone it to a new date.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1,
                    minWidth: { sm: 260 },
                  }}
                >
                  <Button
                    onClick={() => {
                      setStatusAction("cancelled");
                      setStatusReason("");
                    }}
                    sx={{
                      color: "#ef4444",
                      bgcolor:
                        statusAction === "cancelled"
                          ? "rgba(239,68,68,0.14)"
                          : "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.28)",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "rgba(239,68,68,0.18)" },
                    }}
                  >
                    Cancel Match
                  </Button>
                  <Button
                    onClick={() => {
                      setStatusAction("postponed");
                      setStatusReason("");
                    }}
                    sx={{
                      color: "#38bdf8",
                      bgcolor:
                        statusAction === "postponed"
                          ? "rgba(56,189,248,0.14)"
                          : "rgba(56,189,248,0.08)",
                      border: "1px solid rgba(56,189,248,0.28)",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "rgba(56,189,248,0.18)" },
                    }}
                  >
                    Postpone Match
                  </Button>
                </Box>
              </Box>

              {statusAction && (
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  {statusAction === "postponed" && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1.5,
                      }}
                    >
                      <CustomInput
                        type='date'
                        label='New date *'
                        value={postponeDate}
                        onChange={(event) => setPostponeDate(event.target.value)}
                        sx={{
                          "& input::-webkit-calendar-picker-indicator": {
                            filter: "invert(1)",
                          },
                        }}
                      />
                      <CustomInput
                        type='time'
                        label='New time *'
                        value={postponeTime}
                        onChange={(event) => setPostponeTime(event.target.value)}
                        sx={{
                          "& input::-webkit-calendar-picker-indicator": {
                            filter: "invert(1)",
                          },
                        }}
                      />
                    </Box>
                  )}

                  <CustomInput
                    label={
                      statusAction === "cancelled"
                        ? "Cancellation reason *"
                        : "Postponement reason *"
                    }
                    placeholder={
                      statusAction === "cancelled"
                        ? "Why is this match being cancelled?"
                        : "Why is this match being postponed?"
                    }
                    multiline
                    rows={3}
                    value={statusReason}
                    onChange={(event) => setStatusReason(event.target.value)}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      flexDirection: { xs: "column-reverse", sm: "row" },
                    }}
                  >
                    <Button
                      onClick={() => {
                        setStatusAction(null);
                        setStatusReason("");
                      }}
                      disabled={isLoading}
                      sx={{
                        color: "#9ca3af",
                        borderRadius: "10px",
                        textTransform: "none",
                        px: 2,
                      }}
                    >
                      Close status form
                    </Button>
                    <CustomButton
                      onClick={handleStatusAction}
                      loading={isLoading}
                      disabled={statusActionDisabled}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      {statusActionLabel}
                    </CustomButton>
                  </Box>
                </Box>
              )}
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
    </Box>
  );
};

export default MatchModal;
