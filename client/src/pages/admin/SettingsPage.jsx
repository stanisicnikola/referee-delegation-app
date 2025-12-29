import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from "@mui/material";
import { PageHeader } from "../../components/ui";
import { useAuth } from "../../context";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <PageHeader
        title='Settings'
        subtitle='System configuration and preferences'
      />

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
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
                    Auto-assign Referees
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Automatically suggest referees based on availability
                  </Typography>
                </Box>
                <Switch />
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

        {/* Account Info */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
              Account Information
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Name
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
              borderRadius: 3,
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
              <Button variant='outlined' color='primary'>
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
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
              <Button variant='outlined' color='error'>
                Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
