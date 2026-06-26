import { useEffect } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton, CustomInput } from "../ui";
import { profileSchema } from "../../validations/profileSchema";

const getDefaultValues = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  phone: user?.phone || "",
});

const ProfileEditDialog = ({
  open,
  user,
  onClose,
  onSubmit,
  isLoading,
  submitVariant = "outline",
  accentColor = "#8b5cf6",
}) => {
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const phone = user?.phone || "";
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: getDefaultValues(user),
  });

  useEffect(() => {
    if (open) {
      reset({ firstName, lastName, phone });
    }
  }, [firstName, lastName, open, phone, reset]);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleFormSubmit = (data) =>
    onSubmit({
      ...data,
      phone: data.phone ?? null,
    });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#111114",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle sx={{ color: "white", fontWeight: 700 }}>
        Edit Profile
      </DialogTitle>
      <Box
        component='form'
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
      >
        <DialogContent
          sx={{
            pt: "12px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Controller
            name='firstName'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='First Name'
                placeholder='Enter first name'
                error={errors.firstName?.message}
                accentColor={accentColor}
                disabled={isLoading}
              />
            )}
          />
          <Controller
            name='lastName'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='Last Name'
                placeholder='Enter last name'
                error={errors.lastName?.message}
                accentColor={accentColor}
                disabled={isLoading}
              />
            )}
          />
          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='Phone Number'
                placeholder='+387 6X XXX XXX'
                error={errors.phone?.message}
                accentColor={accentColor}
                disabled={isLoading}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <CustomButton
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type='submit'
            variant={submitVariant}
            loading={isLoading}
          >
            Save Changes
          </CustomButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ProfileEditDialog;
