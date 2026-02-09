import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { competitionSchema } from "../../validations/competitionSchema";

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

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      py: 1.5,
      px: 2,
    },
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };

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
          <Box>
            <Typography sx={labelStyles}>Competition Name *</Typography>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder='e.g. Premijer liga BiH'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={inputStyles}
                />
              )}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Season *</Typography>
              <Controller
                name='season'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder='2024/2025'
                    error={!!errors.season}
                    helperText={errors.season?.message}
                    sx={inputStyles}
                  />
                )}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Categories</Typography>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    sx={inputStyles}
                    error={!!errors.category}
                  >
                    <Select
                      {...field}
                      sx={{ "& .MuiSelect-select": { color: "#fff" } }}
                    >
                      <MenuItem value='seniors'>Seniors</MenuItem>
                      <MenuItem value='juniors'>Juniors</MenuItem>
                      <MenuItem value='youth'>Youth</MenuItem>
                    </Select>
                    {errors.category && (
                      <Typography
                        variant='caption'
                        sx={{ color: "#d32f2f", ml: 1.5, mt: 0.5 }}
                      >
                        {errors.category.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
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
              <Button
                variant='outlined'
                color={isSuspended ? "success" : "error"}
                onClick={() =>
                  onSubmit({
                    ...editCompetition,
                    status: isSuspended ? "active" : "suspended",
                  })
                }
                disabled={isLoading}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  borderColor: isSuspended ? "#22c55e" : "#ef4444",
                  color: isSuspended ? "#22c55e" : "#ef4444",
                  "&:hover": {
                    borderColor: isSuspended ? "#16a34a" : "#dc2626",
                    bgcolor: isSuspended
                      ? "rgba(34, 197, 94, 0.05)"
                      : "rgba(239, 68, 68, 0.05)",
                  },
                }}
              >
                {isSuspended ? "Resume Competition" : "Suspend Competition"}
              </Button>
            </Box>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Start Date</Typography>
              <Controller
                name='startDate'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='date'
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                    sx={{
                      ...inputStyles,
                      "& input::-webkit-calendar-picker-indicator": {
                        filter: "invert(1)",
                      },
                    }}
                  />
                )}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>End Date</Typography>
              <Controller
                name='endDate'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='date'
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                    sx={{
                      ...inputStyles,
                      "& input::-webkit-calendar-picker-indicator": {
                        filter: "invert(1)",
                      },
                    }}
                  />
                )}
              />
            </Box>
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
          <Button
            onClick={onClose}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              color: "#fff",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            disabled={isLoading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : editCompetition ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
