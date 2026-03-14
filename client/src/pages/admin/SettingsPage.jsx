import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CustomButton, PageHeader } from "../../components/ui";
import { useAuth } from "../../context";
import {
  useVerifyPassword,
  useChangePassword,
  useDeleteMe,
} from "../../hooks/useAuthHooks";
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
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete Account Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const loading =
    verifyPasswordMutation.isPending || changePasswordMutation.isPending;
  const deleteLoading = deleteMeMutation.isPending;

  // Password logic
  const handleOpenPasswordModal = () => {
    setPasswordModalOpen(true);
    setActiveStep(0);
    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    setError("");
    try {
      await verifyPasswordMutation.mutateAsync(currentPassword);
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect password.");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      setPasswordModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

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
      }}
    >
      <PageHeader
        title='Settings'
        subtitle='Manage your account and preferences'
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* General Settings - only show for non-admins if it has relevant settings */}
        {!isAdmin && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
                General
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      Email Notifications
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Receive email notifications for new delegations
                    </Typography>
                  </Box>
                  <Switch defaultChecked />
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      Reminder Notifications
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Send reminders 24h before matches
                    </Typography>
                  </Box>
                  <Switch defaultChecked />
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Account Info */}
        <Grid item xs={12} md={isAdmin ? 6 : 6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
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
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
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
              p: 3,
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
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Change Password
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Update your password regularly for better security
                </Typography>
              </Box>
              <CustomButton
                variant='admin-outline'
                onClick={handleOpenPasswordModal}
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
              p: 3,
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
                alignItems: "center",
              }}
            >
              <Box>
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
              >
                Delete Account
              </CustomButton>
            </Box>
          </Paper>
        </Grid>
      </Box>

      {/* Change Password Modal */}
      <Dialog
        open={passwordModalOpen}
        onClose={() => !loading && setPasswordModalOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Change Password</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
            <Step>
              <StepLabel>Verify Current</StepLabel>
            </Step>
            <Step>
              <StepLabel>Set New</StepLabel>
            </Step>
          </Stepper>

          {error && (
            <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 ? (
            <Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Please enter your current password to proceed.
              </Typography>
              <TextField
                fullWidth
                label='Current Password'
                type='password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant='outlined'
                disabled={loading}
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label='New Password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant='outlined'
                disabled={loading}
                helperText='At least 8 characters with upper, lower and numbers'
              />
              <TextField
                fullWidth
                label='Confirm New Password'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant='outlined'
                disabled={loading}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <CustomButton
            variant='outline'
            onClick={() => setPasswordModalOpen(false)}
            disabled={loading}
          >
            Cancel
          </CustomButton>
          {activeStep === 0 ? (
            <CustomButton
              variant='admin-primary'
              onClick={handleVerifyPassword}
              disabled={loading || !currentPassword}
            >
              {loading ? "Loading..." : "Next Step"}
            </CustomButton>
          ) : (
            <CustomButton
              variant='admin-primary'
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Loading..." : "Change Password"}
            </CustomButton>
          )}
        </DialogActions>
      </Dialog>

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
