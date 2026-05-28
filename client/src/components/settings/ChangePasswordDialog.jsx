import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton, PasswordInput } from "../ui";
import {
  changePasswordSchema,
  verifyCurrentPasswordSchema,
} from "../../validations/settingsSchema";

const ChangePasswordDialog = ({
  open,
  onClose,
  onVerifyPassword,
  onChangePassword,
  isLoading,
  primaryVariant = "admin-primary",
  accentColor = "#8b5cf6",
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [apiError, setApiError] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const verifyResolver = zodResolver(verifyCurrentPasswordSchema);
  const changeResolver = zodResolver(changePasswordSchema);

  const {
    control,
    handleSubmit: handleFormSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: (values, context, options) =>
      activeStep === 0
        ? verifyResolver(values, context, options)
        : changeResolver(values, context, options),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setApiError("");
      setVerifiedPassword("");
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [open, reset]);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const verifyPassword = async ({ currentPassword: password }) => {
    setApiError("");
    try {
      await onVerifyPassword(password);
      setVerifiedPassword(password);
      reset({
        currentPassword: password,
        newPassword: "",
        confirmPassword: "",
      });
      setActiveStep(1);
    } catch (error) {
      setApiError(error.response?.data?.message || "Incorrect password.");
    }
  };

  const changePassword = async ({ newPassword: password }) => {
    if (!verifiedPassword) {
      setActiveStep(0);
      setApiError("Please verify your current password first.");
      return;
    }

    setApiError("");
    try {
      await onChangePassword({
        currentPassword: verifiedPassword,
        newPassword: password,
      });
      onClose();
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Failed to change password.",
      );
    }
  };

  const handleSubmit =
    activeStep === 0
      ? handleFormSubmit(verifyPassword)
      : handleFormSubmit(changePassword);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111114",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: "white", fontWeight: 700 }}>
        Change Password
      </DialogTitle>
      <Box component='form' onSubmit={handleSubmit} noValidate>
        <DialogContent
          sx={{
            pt: "12px !important",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Stepper
            activeStep={activeStep}
            sx={{
              "& .MuiStepIcon-root.Mui-active": { color: accentColor },
              "& .MuiStepIcon-root.Mui-completed": { color: accentColor },
              "& .MuiStepLabel-label.Mui-active": { color: "text.primary" },
            }}
          >
            <Step>
              <StepLabel>Verify Current</StepLabel>
            </Step>
            <Step>
              <StepLabel>Set New</StepLabel>
            </Step>
          </Stepper>

          {apiError && (
            <Alert severity='error' sx={{ borderRadius: 2 }}>
              {apiError}
            </Alert>
          )}

          {activeStep === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Please enter your current password to proceed.
              </Typography>
              <Controller
                name='currentPassword'
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label='Current Password'
                    placeholder='Enter current password'
                    error={errors.currentPassword?.message}
                    accentColor={accentColor}
                    disabled={isLoading}
                    autoComplete='current-password'
                  />
                )}
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name='newPassword'
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label='New Password'
                    placeholder='Enter new password'
                    error={errors.newPassword?.message}
                    accentColor={accentColor}
                    disabled={isLoading}
                    autoComplete='new-password'
                  />
                )}
              />
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label='Confirm New Password'
                    placeholder='Repeat new password'
                    error={errors.confirmPassword?.message}
                    accentColor={accentColor}
                    disabled={isLoading}
                    autoComplete='new-password'
                  />
                )}
              />
            </Box>
          )}
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
            variant={primaryVariant}
            disabled={
              isLoading ||
              (activeStep === 0
                ? !currentPassword
                : !newPassword || !confirmPassword)
            }
            loading={isLoading}
          >
            {activeStep === 0 ? "Next Step" : "Change Password"}
          </CustomButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ChangePasswordDialog;
