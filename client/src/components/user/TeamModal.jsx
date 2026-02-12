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
import { teamSchema } from "../../validations/teamSchema";
import { useVenues } from "../../hooks";
import {
  CustomSelect,
  CustomInput,
  CustomButton,
  FormValidationError,
} from "../../components/ui";

export const TeamModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editTeam = null,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      shortName: "",
      city: "",
      primaryVenueId: "",
    },
  });

  const { data: venuesData } = useVenues();
  const venues = venuesData?.data || [];
  const isSuspended = editTeam?.status === "suspended";

  useEffect(() => {
    if (open) {
      if (editTeam) {
        reset({
          name: editTeam.name || "",
          shortName: editTeam.shortName || "",
          city: editTeam.city || "",
          primaryVenueId: editTeam.primaryVenueId || "",
        });
      } else {
        reset({
          name: "",
          shortName: "",
          city: "",
          primaryVenueId: "",
        });
      }
    }
  }, [editTeam, open, reset]);

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
            {editTeam ? "Edit Team" : "New Team"}
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
                label='Team Name *'
                placeholder='e.g. KK Bosna'
                error={errors.name?.message}
              />
            )}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Controller
              name='shortName'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Short Name'
                  placeholder='BOS'
                  error={errors.shortName?.message}
                />
              )}
            />
            <Controller
              name='city'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='City *'
                  placeholder='Sarajevo'
                  error={errors.city?.message}
                />
              )}
            />
          </Box>
          {editTeam && (
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
                {isSuspended ? "Unsuspend Team" : "Suspend Team"}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280", mb: 2 }}>
                {isSuspended
                  ? "This team is currently suspended. Click the button below to unsuspend it."
                  : "Suspending this team will hide it from the delegation process. You can unsuspend it at any time."}
              </Typography>
              <CustomButton
                variant={isSuspended ? "success-outline" : "danger-outline"}
                onClick={() =>
                  onSubmit({
                    ...editTeam,
                    status: isSuspended ? "active" : "suspended",
                  })
                }
                loading={isLoading}
                sx={{ mt: 1 }}
              >
                {isSuspended ? "Unsuspend Team" : "Suspend Team"}
              </CustomButton>
            </Box>
          )}
          <Box>
            <Controller
              name='primaryVenueId'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  options={venues.map((v) => ({ label: v.name, value: v.id }))}
                  label='Home Venue *'
                  placeholder='Select Home Venue'
                  error={!!errors.primaryVenueId}
                />
              )}
            />
            <FormValidationError>
              {errors.primaryVenueId?.message}
            </FormValidationError>
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
            {editTeam ? "Update Team" : "Create Team"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};
