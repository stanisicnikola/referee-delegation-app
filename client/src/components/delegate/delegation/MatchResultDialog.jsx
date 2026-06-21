import { useEffect, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton, CustomInput } from "../../ui";
import {
  matchResultDefaultValues,
  matchResultSchema,
} from "../../../validations/matchResultSchema";

const MatchResultDialog = ({ open, onClose, onSubmit, isLoading, match }) => {
  const defaultValues = useMemo(
    () => ({
      homeScore:
        match?.homeScore === null || match?.homeScore === undefined
          ? ""
          : String(match.homeScore),
      awayScore:
        match?.awayScore === null || match?.awayScore === undefined
          ? ""
          : String(match.awayScore),
      reportNotes: match?.reportNotes || "",
    }),
    [match?.awayScore, match?.homeScore, match?.reportNotes],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(matchResultSchema),
    mode: "onChange",
    defaultValues: matchResultDefaultValues,
  });

  useEffect(() => {
    if (!open) return;

    reset(defaultValues, {
      keepErrors: false,
      keepTouched: false,
    });
  }, [defaultValues, open, reset]);

  const watchedHomeScore = watch("homeScore");
  const watchedAwayScore = watch("awayScore");
  const hasRequiredScores = watchedHomeScore !== "" && watchedAwayScore !== "";

  const normalizeScoreInput = (value) => {
    const nextValue = String(value);

    if (!/^\d+$/.test(nextValue)) return nextValue;

    return nextValue.replace(/^0+(?=\d)/, "");
  };

  const getVisibleScoreError = (value, error) => {
    if (!error?.message) return "";
    if (value === "" && error.message === "Score is required.") return "";

    return error.message;
  };

  const handleFormSubmit = async (values) => {
    await onSubmit({
      homeScore: values.homeScore,
      awayScore: values.awayScore,
      reportNotes: values.reportNotes?.trim() || null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          bgcolor: "#121214",
          color: "#fff",
          border: "1px solid #242428",
          borderRadius: "16px",
          backgroundImage: "none",
        },
      }}
    >
      <Box
        component='form'
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Complete Match
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "8px !important" }}>
          <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>
            {match?.homeTeam?.name || "Home"} vs{" "}
            {match?.awayTeam?.name || "Away"}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <Controller
              name='homeScore'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  value={field.value ?? ""}
                  label={`${match?.homeTeam?.name || "Home"} score`}
                  type='text'
                  placeholder='0'
                  error={getVisibleScoreError(field.value, errors.homeScore)}
                  accentColor='#22c55e'
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  onChange={(event) =>
                    field.onChange(normalizeScoreInput(event.target.value))
                  }
                />
              )}
            />
            <Controller
              name='awayScore'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  value={field.value ?? ""}
                  label={`${match?.awayTeam?.name || "Away"} score`}
                  type='text'
                  placeholder='0'
                  error={getVisibleScoreError(field.value, errors.awayScore)}
                  accentColor='#22c55e'
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  onChange={(event) =>
                    field.onChange(normalizeScoreInput(event.target.value))
                  }
                />
              )}
            />
          </Box>

          <Controller
            name='reportNotes'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                value={field.value ?? ""}
                label='Match report'
                multiline
                minRows={4}
                placeholder='Add match notes, incidents, or administrative remarks...'
                error={errors.reportNotes?.message}
                accentColor='#22c55e'
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexWrap: "wrap" }}>
          <CustomButton
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isLoading}
            sx={{ color: "#9ca3af", px: 2 }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type='submit'
            variant='success'
            startIcon={<CheckIcon />}
            disabled={!hasRequiredScores || !isValid || isLoading}
            loading={isLoading}
            sx={{
              px: 2.5,
              fontWeight: 700,
              "&.Mui-disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
            }}
          >
            Complete Match
          </CustomButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default MatchResultDialog;
