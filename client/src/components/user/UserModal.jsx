import { useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  refereeSchema,
  createRefereeSchema,
} from "../../validations/refereeSchema";
import {
  adminDelegateSchema,
  createAdminDelegateSchema,
} from "../../validations/userSchema";
import RoleSelection from "./RoleSelection";
import RefereeForm from "./RefereeForm";
import AdminDelegateForm from "./AdminDelegateForm";

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
        licenseCategory: user?.referee?.licenseCategory || "international",
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

  // Switch schemas based on role and edit/create mode
  const getResolver = (role) => {
    if (role === "referee") {
      return zodResolver(editUser ? refereeSchema : createRefereeSchema);
    }
    return zodResolver(
      editUser ? adminDelegateSchema : createAdminDelegateSchema,
    );
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors,
  } = useForm({
    resolver: (values, context, options) => {
      // Dynamic resolver based on watched role
      const currentRole = values.role || "referee";
      return getResolver(currentRole)(values, context, options);
    },
    defaultValues: getFormValues(editUser),
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

  // Reset form when modal opens or editUser changes
  useEffect(() => {
    if (open) {
      reset(getFormValues(editUser));
    }
  }, [open, editUser, reset, getFormValues]);

  // Handle role change - reset validation errors for the other schema
  useEffect(() => {
    clearErrors();
  }, [watchedRole, clearErrors]);

  const onSubmit = (data) => {
    // If not referee, strip referee fields before sending
    if (data.role !== "referee") {
      const {
        licenseNumber,
        licenseCategory,
        city,
        experienceYears,
        ...cleanData
      } = data;
      onConfirm(cleanData);
    } else {
      onConfirm(data);
    }
  };

  const handleClose = () => {
    reset(getFormValues(null));
    onClose();
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
      {/* Backdrop */}
      <Box
        onClick={handleClose}
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
        noValidate
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
            onClick={handleClose}
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

          {/* Dynamic Form Content */}
          {watchedRole === "referee" ? (
            <RefereeForm
              control={control}
              errors={errors}
              editUser={editUser}
            />
          ) : (
            <AdminDelegateForm
              control={control}
              errors={errors}
              editUser={editUser}
            />
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
            onClick={handleClose}
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
