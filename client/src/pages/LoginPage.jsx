import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Check as CheckIcon,
  SportsBasketball as BasketballIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";
import { loginSchema } from "../hooks/useAuthValidation";
import { CustomButton, CustomInput, PasswordInput } from "../components/ui";

// Feature item component
const FeatureItem = ({ text }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        bgcolor: "rgba(249, 115, 22, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CheckIcon sx={{ color: "primary.main", fontSize: 20 }} />
    </Box>
    <Typography variant='body1' sx={{ color: "grey.300" }}>
      {text}
    </Typography>
  </Box>
);

// Stat item component
const StatItem = ({ value, label }) => (
  <Box>
    <Typography variant='h4' sx={{ fontWeight: 700, color: "primary.main" }}>
      {value}
    </Typography>
    <Typography variant='body2' sx={{ color: "grey.500" }}>
      {label}
    </Typography>
  </Box>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const result = await login(data);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setLoginError(result.error || "Login error");
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "Login error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* Left Side - Branding (hidden on mobile) */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "50%",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          background:
            "linear-gradient(135deg, #0a0a0b 0%, #121214 50%, #0a0a0b 100%)",
        }}
      >
        {/* Floating shapes */}
        <Box
          sx={{
            position: "absolute",
            width: 256,
            height: 256,
            bgcolor: "rgba(249, 115, 22, 0.1)",
            borderRadius: "50%",
            top: 80,
            left: -80,
            filter: "blur(60px)",
            animation: "float 6s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-20px)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 384,
            height: 384,
            bgcolor: "rgba(249, 115, 22, 0.05)",
            borderRadius: "50%",
            bottom: 80,
            right: 40,
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, zIndex: 1 }}
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
              boxShadow: "0 0 40px 10px rgba(249, 115, 22, 0.15)",
            }}
          >
            <BasketballIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              RefDelegate
            </Typography>
            <Typography variant='body2' sx={{ color: "grey.500" }}>
              Referee Delegation System
            </Typography>
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{ zIndex: 1 }}>
          <Typography
            variant='h2'
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 3,
            }}
          >
            Manage
            <br />
            <Box
              component='span'
              sx={{
                background:
                  "linear-gradient(-45deg, #f97316, #ea580c, #fb923c)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              delegations
            </Box>
            <br />
            easily.
          </Typography>

          <Typography
            variant='h6'
            sx={{ color: "grey.400", maxWidth: 400, mb: 4, fontWeight: 400 }}
          >
            A complete platform for delegating referees to basketball games.
            Fast, reliable, professional.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FeatureItem text='Automatic notifications and reminders' />
            <FeatureItem text='Real-time availability tracking' />
            <FeatureItem text='Full control over schedule' />
          </Box>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            zIndex: 1,
          }}
        ></Box>

        {/* Basketball illustration */}
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 384,
            height: 384,
            opacity: 0.1,
          }}
        >
          <BasketballIcon
            sx={{ width: "100%", height: "100%", color: "primary.main" }}
          />
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 256,
              height: 256,
              bgcolor: "rgba(249, 115, 22, 0.05)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 256,
              height: 256,
              bgcolor: "rgba(249, 115, 22, 0.05)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 440, zIndex: 1 }}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "flex", lg: "none" },
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

          {/* Form Card */}
          <Card elevation={0}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back
              </Typography>
              <Typography variant='body2' sx={{ color: "#ffffff6c", mb: 4 }}>
                Sign in to your account
              </Typography>

              {loginError && (
                <Alert severity='error' sx={{ mb: 3 }}>
                  {loginError}
                </Alert>
              )}

              <Box
                component='form'
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
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

                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      {...field}
                      label='Password'
                      placeholder='Enter your password'
                      error={errors?.password?.message}
                      autoComplete='off'
                      loginType
                    />
                  )}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          color: "grey.600",
                          "&.Mui-checked": { color: "primary.main" },
                        }}
                      />
                    }
                    label={
                      <Typography variant='body2' sx={{ color: "grey.400" }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href='#'
                    underline='hover'
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <CustomButton
                  variant='primary'
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={handleSubmit(onSubmit)}
                >
                  Sign in
                </CustomButton>
              </Box>
            </CardContent>
          </Card>

          {/* Footer */}
          <Typography
            variant='body2'
            sx={{ textAlign: "center", color: "grey.500", mt: 4 }}
          >
            © 2025 RefDelegate. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
