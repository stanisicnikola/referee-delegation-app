import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { competitionSchema } from "../../validations/competitionSchema";
import { CustomSelect, CustomInput, CustomButton } from "../ui";

export const CompetitionModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editCompetition = null,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name: "",
      season: "",
      category: "seniors",
      startDate: "",
      endDate: "",
    },
  });

  const currentStatus = editCompetition?.status;
  const isCompleted = currentStatus === "completed";
  const isSuspended = currentStatus === "suspended";

  useEffect(() => {
    if (open) {
      if (editCompetition) {
        reset({
          name: editCompetition.name || "",
          season: editCompetition.season || "",
          category: editCompetition.category || "seniors",
          startDate: editCompetition.startDate
            ? new Date(editCompetition.startDate).toISOString().split("T")[0]
            : "",
          endDate: editCompetition.endDate
            ? new Date(editCompetition.endDate).toISOString().split("T")[0]
            : "",
        });
      } else {
        reset({
          name: "",
          season: "",
          category: "seniors",
          startDate: "",
          endDate: "",
        });
      }
    }
  }, [editCompetition, open, reset]);

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

  const onFormSubmit = (data) => {
    onSubmit(data);
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
          bgcolor: "rgba(0,0,0,0.8)",
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
          maxWidth: 500,
          mx: 2,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            {editCompetition ? "Edit Competition" : "New Competition"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='Competition Name *'
                placeholder='e.g. Premijer liga BiH'
                error={errors.name?.message}
              />
            )}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Controller
              name='season'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Season *'
                  placeholder='2024/2025'
                  error={errors.season?.message}
                />
              )}
            />
            <Controller
              name='category'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  label='Categories'
                  options={[
                    { label: "Seniors", value: "seniors" },
                    { label: "Juniors", value: "juniors" },
                    { label: "Youth", value: "youth" },
                  ]}
                />
              )}
            />
          </Box>

          {editCompetition && !isCompleted && (
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  mb: 0.5,
                }}
              >
                {isSuspended ? "Resume Competition" : "Suspend Competition"}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280", mb: 2 }}>
                {isSuspended
                  ? "This competition is currently suspended. Click the button below to resume it."
                  : "Suspending this competition will hide it from the delegation process. You can resume it at any time."}
              </Typography>
              <CustomButton
                variant={isSuspended ? "success-outline" : "danger-outline"}
                onClick={() =>
                  onSubmit({
                    ...editCompetition,
                    status: isSuspended ? "active" : "suspended",
                  })
                }
                loading={isLoading}
                sx={{ mt: 1 }}
              >
                {isSuspended ? "Resume Competition" : "Suspend Competition"}
              </CustomButton>
            </Box>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Controller
              name='startDate'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  type='date'
                  label='Start Date'
                  error={errors.startDate?.message}
                  sx={{
                    "& input::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                    },
                  }}
                />
              )}
            />
            <Controller
              name='endDate'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  type='date'
                  label='End Date'
                  error={errors.endDate?.message}
                  sx={{
                    "& input::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                    },
                  }}
                />
              )}
            />
          </Box>
        </Box>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <CustomButton variant='outline' onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit(onFormSubmit)}
            loading={isLoading}
          >
            {editCompetition ? "Update Competition" : "Create Competition"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};
