import { useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
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
import { matchSchema } from "../../validations/matchSchema";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";

const MatchModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editMatch = null,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(matchSchema),
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
  const { data: delegatesData } = useUserStatistics();

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
      }
    }
  }, [editMatch, open, reset]);

  const onFormSubmit = (data) => {
    const { date, time, ...rest } = data;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onSubmit({ ...rest, scheduledAt });
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          mx: 2,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "#121214",
            px: 3,
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

        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "#121214",
            px: 3,
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
            zIndex: 10,
          }}
        >
          <CustomButton variant='outline' onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit(onFormSubmit)}
            loading={isLoading}
          >
            {editMatch ? "Update Match" : "Create Match"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default MatchModal;
