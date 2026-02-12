import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, updateUserSchema } from "../../hooks/userValidation";
import RoleSelection from "./RoleSelection";
import { CustomInput, CustomSelect } from "../ui";

const UserModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  editUser = null,
  allowedRoles = null,
}) => {
  const getFormValues = useCallback(
    (user = null) => {
      return {
        role: user?.role || allowedRoles?.[0] || "referee",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        status: user?.status || "active",
        licenseNumber: user?.referee?.licenseNumber || "",
        licenseCategory: user?.referee?.licenseCategory || "",
        city: user?.referee?.city || "",
        experienceYears:
          user?.referee?.experienceYears !== undefined &&
          user?.referee?.experienceYears !== null
            ? String(user.referee.experienceYears)
            : "",
        password: "",
        confirmPassword: "",
        sendWelcomeEmail: !user,
        requirePasswordChange: true,
      };
    },
    [allowedRoles],
  );

  const [showPassword, setShowPassword] = useState(false);
  const schema = editUser ? updateUserSchema : createUserSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: allowedRoles?.[0] || "referee",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "active",
      licenseNumber: "",
      licenseCategory: "",
      city: "",
      experienceYears: "",
      password: "",
      confirmPassword: "",
      sendWelcomeEmail: !editUser,
      requirePasswordChange: true,
    },
  });
  const watchedRole = watch("role");

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

  useEffect(() => {
    reset(getFormValues(editUser));
  }, [editUser, reset, getFormValues]);

  const onSubmit = (data) => {
    if (data.role !== "referee") {
      // eslint-disable-next-line no-unused-vars
      const { licenseNumber, licenseCategory, city, experienceYears, ...rest } =
        data;
      onConfirm(rest);
      return;
    }
    onConfirm(data);
  };

  if (!open) return null;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
      },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      py: 1.5,
      px: 2,
    },
    "& .MuiInputBase-input::placeholder": { color: "#6b7280", opacity: 1 },
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
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          position: "relative",
          bgcolor: "#121214",
          borderRadius: "16px",
          border: "1px solid #242428",
          width: "100%",
          maxWidth: 640,
          mx: 2,
          maxHeight: "90vh",
          overflow: "auto",
          animation: "slideIn 0.3s ease-out",
          "@keyframes slideIn": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "#121214",
            px: 3,
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            {editUser ? "Edit User" : "New User"}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: "#6b7280", "&:hover": { bgcolor: "#242428" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Role Selection */}
          <RoleSelection
            watchedRole={watchedRole}
            onChange={(value) => setValue("role", value)}
            editUser={editUser}
            allowedRoles={allowedRoles}
          />

          {/* Basic Info */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Controller
                name='firstName'
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label='First Name *'
                    placeholder='Enter first name'
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name='lastName'
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label='Last Name *'
                    placeholder='Enter last name'
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Contact */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label='Email *'
                    type='email'
                    placeholder='email@example.com'
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name='phone'
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label='Phone'
                    placeholder='+387 6X XXX XXX'
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Status *</Typography>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Referee Fields */}
          {watchedRole === "referee" && (
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(26, 26, 29, 0.5)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                sx={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af" }}
              >
                Referee Details
              </Typography>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Controller
                    name='licenseNumber'
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        {...field}
                        label='License Number *'
                        placeholder='SUD-XXXX-XXX'
                        error={!!errors.licenseNumber}
                        helperText={errors.licenseNumber?.message}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Typography sx={labelStyles}>Category *</Typography>
                  <Controller
                    name='licenseCategory'
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        {...field}
                        options={[
                          { value: "international", label: "International" },
                          { value: "A", label: "Category A" },
                          { value: "B", label: "Category B" },
                          { value: "C", label: "Category C" },
                          { value: "regional", label: "Regional" },
                        ]}
                        error={!!errors.licenseCategory}
                        helperText={errors.licenseCategory?.message}
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Controller
                    name='city'
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        {...field}
                        label='City *'
                        placeholder='e.g. Sarajevo'
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name='experienceYears'
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        {...field}
                        label='Years of Experience'
                        placeholder='0'
                        error={!!errors.experienceYears}
                        helperText={errors.experienceYears?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Password */}
          {!editUser ? (
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Box>
                <Typography sx={labelStyles}>Password *</Typography>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      placeholder='Minimum 8 characters'
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={inputStyles}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge='end'
                              sx={{ color: "grey.200" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
              <Box>
                <Typography sx={labelStyles}>Confirm Password *</Typography>
                <Controller
                  name='confirmPassword'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type='password'
                      placeholder='Repeat password'
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      sx={inputStyles}
                    />
                  )}
                />
              </Box>
            </Box>
          ) : null}

          {/* Options */}
          {!editUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Controller
                name='sendWelcomeEmail'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        sx={{
                          color: "#3f3f46",
                          "&.Mui-checked": { color: "#8b5cf6" },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                        Send welcome email
                      </Typography>
                    }
                  />
                )}
              />
              <Controller
                name='requirePasswordChange'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        sx={{
                          color: "#3f3f46",
                          "&.Mui-checked": { color: "#8b5cf6" },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                        Require password change
                      </Typography>
                    }
                  />
                )}
              />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "#121214",
            px: 3,
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isLoading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isLoading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
              "&:disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : editUser ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserModal;
