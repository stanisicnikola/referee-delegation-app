import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Email as EmailIcon } from "@mui/icons-material";
import { authApi } from "../../api";
import { forgotPasswordSchema } from "../../hooks/useAuthValidation";
import { CustomButton, CustomInput } from "../ui";

const ForgotPasswordDialog = ({ open, onClose }) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ email: "" });
      setServerError("");
      setSuccessMessage("");
      setIsLoading(false);
    }
  }, [open, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const response = await authApi.forgotPassword(data);
      setSuccessMessage(
        response.message ||
          "If an account with that email exists, a reset link has been sent.",
      );
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Password reset link could not be sent. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#121214",
            backgroundImage: "none",
            borderRadius: "16px",
            border: "1px solid #242428",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #242428",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ color: "#fff", fontSize: "24px", fontWeight: 700 }}>
            Reset password
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#9ca3af", fontSize: "14px" }}>
            Enter your email and we will send you a link to choose a new
            password.
          </Typography>
        </Box>
        <IconButton
          aria-label='Close reset password dialog'
          onClick={onClose}
          size='small'
          sx={{
            color: "#9ca3af",
            "&:hover": { bgcolor: "#242428", color: "#fff" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: "12px !important", pb: 1 }}>
        <Box
          component='form'
          id='forgot-password-form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {serverError && <Alert severity='error'>{serverError}</Alert>}
          {successMessage && <Alert severity='success'>{successMessage}</Alert>}

          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label='Email address'
                placeholder='your@email.com'
                error={errors?.email?.message}
                loginType
                autoComplete='email'
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <EmailIcon sx={{ color: "grey.500" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #242428",
          gap: 1,
        }}
      >
        <CustomButton variant='secondary' onClick={onClose}>
          Cancel
        </CustomButton>
        <CustomButton
          type='submit'
          form='forgot-password-form'
          variant='primary'
          loading={isLoading}
          disabled={isLoading || Boolean(successMessage)}
        >
          Send link
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
