import { Box, IconButton, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema } from "../../validations/teamSchema";
import { useVenues } from "../../hooks";
import { CustomSelect, CustomInput, CustomButton } from "../../components/ui";
import { panelVariantColors } from "../../theme/theme";

const PRIMARY_BUTTON_VARIANTS = {
  admin: "admin-primary",
  delegate: "delegate-primary",
  referee: "referee-primary",
};

export const TeamModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editTeam = null,
  panelVariant = "admin",
  accentColor = panelVariantColors[panelVariant] || panelVariantColors.admin,
  primaryButtonVariant = PRIMARY_BUTTON_VARIANTS[panelVariant] ||
    PRIMARY_BUTTON_VARIANTS.admin,
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
  const venueOptions = useMemo(
    () =>
      (venuesData?.data || []).map((venue) => ({
        label: venue.name,
        value: venue.id,
      })),
    [venuesData?.data],
  );
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
          bgcolor: "rgba(0,0,0,0.8)",
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
            {editTeam ? "Edit Team" : "New Team"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='Team Name *'
                placeholder='e.g. KK Bosna'
                error={errors.name?.message}
                accentColor={accentColor}
              />
            )}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Controller
              name='shortName'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Short Name'
                  placeholder='BOS'
                  error={errors.shortName?.message}
                  accentColor={accentColor}
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
                  accentColor={accentColor}
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
                  options={venueOptions}
                  label='Home Venue *'
                  placeholder='Select Home Venue'
                  error={errors.primaryVenueId?.message}
                  variant={panelVariant}
                />
              )}
            />
          </Box>
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
            variant={primaryButtonVariant}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {editTeam ? "Update Team" : "Create Team"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};
