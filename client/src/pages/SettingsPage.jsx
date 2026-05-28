import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { CustomButton, PageHeader } from "../components/ui";
import ChangePasswordDialog from "../components/settings/ChangePasswordDialog";
import { useAuth } from "../context";
import {
  useVerifyPassword,
  useChangePassword,
  useDeleteMe,
} from "../hooks/useAuthHooks";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Hooks
  const verifyPasswordMutation = useVerifyPassword();
  const changePasswordMutation = useChangePassword();
  const deleteMeMutation = useDeleteMe();

  // Password Change Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Delete Account Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const roleVariants = {
    admin: {
      primary: "admin-primary",
      outline: "admin-outline",
      accent: "#8b5cf6",
    },
    delegate: {
      primary: "delegate-primary",
      outline: "delegate-outline",
      accent: "#f97316",
    },
    referee: {
      primary: "referee-primary",
      outline: "referee-outline",
      accent: "#22c55e",
    },
  };
  const roleVariant = roleVariants[user?.role] || roleVariants.admin;
  const rolePrimaryVariant = roleVariant.primary;
  const roleOutlineVariant = roleVariant.outline;
  const loading =
    verifyPasswordMutation.isPending || changePasswordMutation.isPending;
  const deleteLoading = deleteMeMutation.isPending;

  // Password logic
  const handleOpenPasswordModal = () => {
    setPasswordModalOpen(true);
  };

  useEffect(() => {
    if (user?.mustChangePassword) {
      setPasswordModalOpen(true);
    }
  }, [user?.mustChangePassword]);

  // Delete account logic
  const handleDeleteAccount = async () => {
    try {
      await deleteMeMutation.mutateAsync();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        width: "100%",
      }}
    >
      <PageHeader
        title='Settings'
        subtitle='Manage your account and security'
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Account Info */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
              Account Information
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Full Name
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Email
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    overflowWrap: "anywhere",
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Role
                </Typography>
                <Typography
                  variant='body1'
                  sx={{ fontWeight: 500, textTransform: "capitalize" }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Security */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
              Security
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Change Password
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Update your password regularly for better security
                </Typography>
              </Box>
              <CustomButton
                variant={roleOutlineVariant}
                onClick={handleOpenPasswordModal}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Change Password
              </CustomButton>
            </Box>
          </Paper>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "error.main",
              bgcolor: "rgba(239, 68, 68, 0.05)",
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, mb: 3, color: "error.main" }}
            >
              Danger Zone
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Delete Account
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Permanently delete your account and all associated data
                </Typography>
              </Box>
              <CustomButton
                variant='danger'
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Delete Account
              </CustomButton>
            </Box>
          </Paper>
        </Grid>
      </Box>

      <ChangePasswordDialog
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onVerifyPassword={verifyPasswordMutation.mutateAsync}
        onChangePassword={changePasswordMutation.mutateAsync}
        isLoading={loading}
        primaryVariant={rolePrimaryVariant}
        accentColor={roleVariant.accent}
      />

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action is
            permanent and cannot be undone. All your data will be removed from
            our system.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <CustomButton
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            variant='outline'
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleDeleteAccount}
            variant='danger'
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
