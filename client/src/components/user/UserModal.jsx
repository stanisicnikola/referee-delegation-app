import { useCallback, useEffect, useMemo } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
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
import CustomButton from "../ui/CustomButton";

const PANEL_ACCENTS = {
  admin: "#8b5cf6",
  delegate: "#f97316",
  referee: "#22c55e",
};

const PANEL_PRIMARY_VARIANTS = {
  admin: "admin-primary",
  delegate: "delegate-primary",
  referee: "referee-primary",
};

const getRoleLabel = (allowedRoles) => {
  if (allowedRoles?.length !== 1) return "User";

  const [role] = allowedRoles;
  if (role === "referee") return "Referee";
  if (role === "delegate") return "Delegate";
  if (role === "admin") return "Admin";

  return "User";
};

const UserModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  editUser = null,
  allowedRoles = null,
  panelVariant = "admin",
}) => {
  const accentColor = PANEL_ACCENTS[panelVariant] || PANEL_ACCENTS.admin;
  const primaryVariant =
    PANEL_PRIMARY_VARIANTS[panelVariant] || PANEL_PRIMARY_VARIANTS.admin;
  const roleLabel = getRoleLabel(allowedRoles);
  const modalTitle = editUser ? `Edit ${roleLabel}` : `New ${roleLabel}`;
  const submitLabel = editUser ? `Update ${roleLabel}` : `Create ${roleLabel}`;

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

  const refereeResolver = useMemo(
    () => zodResolver(editUser ? refereeSchema : createRefereeSchema),
    [editUser],
  );
  const adminDelegateResolver = useMemo(
    () =>
      zodResolver(editUser ? adminDelegateSchema : createAdminDelegateSchema),
    [editUser],
  );
  const resolver = useCallback(
    (values, context, options) => {
      const currentRole = values.role || allowedRoles?.[0] || "referee";
      const currentResolver =
        currentRole === "referee" ? refereeResolver : adminDelegateResolver;

      return currentResolver(values, context, options);
    },
    [adminDelegateResolver, allowedRoles, refereeResolver],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
  } = useForm({
    resolver,
    defaultValues: getFormValues(editUser),
  });

  const watchedRole = useWatch({ control, name: "role" });

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
    if (open) {
      reset(getFormValues(editUser), {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
      });
    }
  }, [open, editUser, reset, getFormValues]);

  useEffect(() => {
    clearErrors();
  }, [watchedRole, clearErrors]);

  const onSubmit = (data) => {
    if (data.role !== "referee") {
      const cleanData = { ...data };
      delete cleanData.licenseNumber;
      delete cleanData.licenseCategory;
      delete cleanData.city;
      delete cleanData.experienceYears;
      onConfirm(cleanData);
    } else {
      onConfirm(data);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleRoleChange = (value) => {
    setValue("role", value, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
        onClick={handleClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.8)",
        }}
      />

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
          <Typography
            sx={{
              fontSize: { xs: "18px", sm: "20px" },
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {modalTitle}
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{ color: "#6b7280", "&:hover": { bgcolor: "#242428" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 3 },
          }}
        >
          <RoleSelection
            watchedRole={watchedRole}
            onChange={handleRoleChange}
            editUser={editUser}
            allowedRoles={allowedRoles}
            variant={panelVariant}
          />

          {watchedRole === "referee" ? (
            <RefereeForm
              control={control}
              errors={errors}
              editUser={editUser}
              variant={panelVariant}
              accentColor={accentColor}
            />
          ) : (
            <AdminDelegateForm
              control={control}
              errors={errors}
              editUser={editUser}
              variant={panelVariant}
              accentColor={accentColor}
            />
          )}
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
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1.5,
          }}
        >
          <CustomButton
            variant='outline'
            onClick={handleClose}
            disabled={isLoading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type='submit'
            variant={primaryVariant}
            disabled={isLoading}
            loading={isLoading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {submitLabel}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default UserModal;
