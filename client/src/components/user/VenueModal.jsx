import { Box, IconButton, Typography } from "@mui/material";
import { useEffect } from "react";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueSchema } from "../../validations/venueSchema";
import { CustomInput, CustomButton } from "../ui";

export const VenueModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editVenue = null,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      city: "",
      address: "",
      capacity: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editVenue) {
        reset({
          name: editVenue.name || "",
          city: editVenue.city || "",
          address: editVenue.address || "",
          capacity: editVenue.capacity ?? "",
        });
      } else {
        reset({
          name: "",
          city: "",
          address: "",
          capacity: "",
        });
      }
    }
  }, [editVenue, open, reset]);

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
            {editVenue ? "Edit Venue" : "New Venue"}
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
                label='Venue Name *'
                placeholder='e.g. Dvorana Skenderija'
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name='address'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='Address *'
                placeholder='Full address'
                error={errors.address?.message}
              />
            )}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
            <Controller
              name='capacity'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Capacity'
                  placeholder='5000'
                  error={errors.capacity?.message}
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
            {editVenue ? "Update Venue" : "Create Venue"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};
