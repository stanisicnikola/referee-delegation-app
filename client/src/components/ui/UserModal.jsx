import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  VerifiedUser as AdminIcon,
} from "@mui/icons-material";

const UserModal = ({ open, onClose, onSubmit, isLoading, editUser = null, allowedRoles = null }) => {
  const [formData, setFormData] = useState({
    role: "referee",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseCategory: "",
    city: "",
    experienceYears: "",
    password: "",
    confirmPassword: "",
    sendWelcomeEmail: true,
    requirePasswordChange: false,
  });

  const [errors, setErrors] = useState({});

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
    if (editUser) {
      setFormData({
        role: editUser.role || "referee",
        firstName: editUser.firstName || "",
        lastName: editUser.lastName || "",
        email: editUser.email || "",
        phone: editUser.phone || "",
        licenseNumber: editUser.referee?.licenseNumber || "",
        licenseCategory: editUser.referee?.licenseCategory || "",
        city: editUser.referee?.city || "",
        experienceYears: editUser.referee?.experienceYears || "",
        password: "",
        confirmPassword: "",
        sendWelcomeEmail: false,
        requirePasswordChange: false,
      });
    } else {
      setFormData({
        role: "referee",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        licenseNumber: "",
        licenseCategory: "",
        city: "",
        experienceYears: "",
        password: "",
        confirmPassword: "",
        sendWelcomeEmail: true,
        requirePasswordChange: false,
      });
    }
    setErrors({});
  }, [editUser, open]);

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!editUser && !formData.password)
      newErrors.password = "Password is required";
    if (!editUser && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.role === "referee") {
      if (!formData.licenseNumber)
        newErrors.licenseNumber = "License number is required";
      if (!formData.licenseCategory)
        newErrors.licenseCategory = "Category is required";
      if (!formData.city) newErrors.city = "City is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
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
          <Box>
            <Typography sx={labelStyles}>User Type *</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1.5,
              }}
            >
              {[
                {
                  value: "referee",
                  label: "Referee",
                  icon: PersonIcon,
                  color: "#22c55e",
                },
                {
                  value: "delegate",
                  label: "Delegate",
                  icon: GroupsIcon,
                  color: "#3b82f6",
                },
                {
                  value: "admin",
                  label: "Admin",
                  icon: AdminIcon,
                  color: "#8b5cf6",
                },
              ].map((role) => {
                const isSelected = formData.role === role.value;
                // Disabled if: editing user and not selected, OR role not in allowedRoles
                const isDisabled = 
                  (editUser && !isSelected) || 
                  (allowedRoles && !allowedRoles.includes(role.value));

                return (
                  <Box
                    key={role.value}
                    onClick={() => {
                      if (!isDisabled) {
                        handleChange("role")({ target: { value: role.value } });
                      }
                    }}
                    sx={{
                      p: 2,
                      bgcolor: "#1a1a1d",
                      border: "2px solid",
                      borderColor: isSelected ? "#8b5cf6" : "#242428",
                      borderRadius: "12px",
                      textAlign: "center",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      opacity: isDisabled ? 0.4 : 1,
                      "&:hover": {
                        borderColor: isDisabled
                          ? "#242428"
                          : isSelected
                          ? "#8b5cf6"
                          : "#3f3f46",
                      },
                      ...(isSelected && {
                        bgcolor: "rgba(139, 92, 246, 0.1)",
                      }),
                    }}
                  >
                    <role.icon
                      sx={{
                        fontSize: 32,
                        color: isDisabled ? "#4b5563" : role.color,
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: isDisabled ? "#4b5563" : "#fff",
                      }}
                    >
                      {role.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Basic Info */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>First Name *</Typography>
              <TextField
                fullWidth
                placeholder='Enter first name'
                value={formData.firstName}
                onChange={handleChange("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={inputStyles}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Last Name *</Typography>
              <TextField
                fullWidth
                placeholder='Enter last name'
                value={formData.lastName}
                onChange={handleChange("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={inputStyles}
              />
            </Box>
          </Box>

          {/* Contact */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Email *</Typography>
              <TextField
                fullWidth
                type='email'
                placeholder='email@example.com'
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                sx={inputStyles}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Phone</Typography>
              <TextField
                fullWidth
                placeholder='+387 6X XXX XXX'
                value={formData.phone}
                onChange={handleChange("phone")}
                sx={inputStyles}
              />
            </Box>
          </Box>

          {/* Referee Fields */}
          {formData.role === "referee" && (
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
                  <Typography sx={labelStyles}>License Number *</Typography>
                  <TextField
                    fullWidth
                    placeholder='SUD-XXXX-XXX'
                    value={formData.licenseNumber}
                    onChange={handleChange("licenseNumber")}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber}
                    sx={inputStyles}
                  />
                </Box>
                <Box>
                  <Typography sx={labelStyles}>Category *</Typography>
                  <FormControl fullWidth sx={inputStyles}>
                    <Select
                      value={formData.licenseCategory}
                      onChange={handleChange("licenseCategory")}
                      displayEmpty
                      error={!!errors.licenseCategory}
                      sx={{
                        "& .MuiSelect-select": {
                          color: formData.licenseCategory ? "#fff" : "#6b7280",
                        },
                      }}
                    >
                      <MenuItem value='' disabled>
                        Select category
                      </MenuItem>
                      <MenuItem value='international'>International</MenuItem>
                      <MenuItem value='A'>Category A</MenuItem>
                      <MenuItem value='B'>Category B</MenuItem>
                      <MenuItem value='C'>Category C</MenuItem>
                      <MenuItem value='regional'>Regional</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography sx={labelStyles}>City *</Typography>
                  <TextField
                    fullWidth
                    placeholder='e.g. Sarajevo'
                    value={formData.city}
                    onChange={handleChange("city")}
                    error={!!errors.city}
                    helperText={errors.city}
                    sx={inputStyles}
                  />
                </Box>
                <Box>
                  <Typography sx={labelStyles}>Years of Experience</Typography>
                  <TextField
                    fullWidth
                    type='number'
                    placeholder='0'
                    value={formData.experienceYears}
                    onChange={handleChange("experienceYears")}
                    sx={inputStyles}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Password */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>
                Password {!editUser && "*"}
              </Typography>
              <TextField
                fullWidth
                type='password'
                placeholder='Minimum 8 characters'
                value={formData.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
                sx={inputStyles}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>
                Confirm Password {!editUser && "*"}
              </Typography>
              <TextField
                fullWidth
                type='password'
                placeholder='Repeat password'
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={inputStyles}
              />
            </Box>
          </Box>

          {/* Options */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendWelcomeEmail}
                  onChange={handleChange("sendWelcomeEmail")}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.requirePasswordChange}
                  onChange={handleChange("requirePasswordChange")}
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
          </Box>
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
            onClick={handleSubmit}
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
