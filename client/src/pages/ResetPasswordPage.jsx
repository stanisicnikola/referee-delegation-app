import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Typography,
} from "@mui/material";
import { SportsBasketball as BasketballIcon } from "@mui/icons-material";
import { authApi } from "../api";
import { PasswordInput } from "../components/ui";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Password could not be updated. Please request a new link.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BasketballIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            RefDelegate
          </Typography>
        </Box>

        <Card elevation={0}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
              Set new password
            </Typography>
            <Typography variant='body2' sx={{ color: "#ffffff6c", mb: 4 }}>
              Choose a password for your account.
            </Typography>

            {serverError && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {serverError}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 3 }}>
                Password updated. Redirecting to login.
              </Alert>
            )}

            <Box
              component='form'
              onSubmit={handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <Controller
                name='newPassword'
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label='New password'
                    placeholder='Minimum 8 characters'
                    autoComplete='new-password'
                    error={errors?.newPassword?.message}
                    loginType
                  />
                )}
              />

              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label='Confirm password'
                    placeholder='Repeat password'
                    autoComplete='new-password'
                    error={errors?.confirmPassword?.message}
                    loginType
                  />
                )}
              />

              <Button
                type='submit'
                variant='contained'
                disabled={isLoading || success}
                sx={{ py: 1.25, mt: 1, fontWeight: 700 }}
              >
                {isLoading ? "Saving..." : "Save password"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Link component={RouterLink} to='/login' underline='hover'>
                Back to login
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
