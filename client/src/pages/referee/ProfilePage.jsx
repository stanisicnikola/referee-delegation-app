import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  SportsSoccer as SoccerIcon,
  EmojiEvents as TrophyIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context";
import { useMyStatistics } from "../../hooks";
import { authApi } from "../../api";
import { useSnackbar } from "notistack";

// Orange accent for referee panel
const ACCENT_COLOR = "#f97316";

const ProfilePage = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Statistics
  const { data: statisticsData } = useMyStatistics();

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("Sva polja su obavezna");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Nova lozinka mora imati najmanje 6 znakova");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Nove lozinke se ne podudaraju");
      return;
    }

    setPasswordLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      enqueueSnackbar("Lozinka je uspješno promijenjena", {
        variant: "success",
      });
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Greška pri promjeni lozinke"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get referee info if available
  const referee = user?.referee || user?.Referee;
  const stats = statisticsData?.data;

  const getRoleLabel = (role) => {
    const roles = {
      admin: "Administrator",
      delegate: "Delegat",
      referee: "Sudac",
    };
    return roles[role] || role;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    const statuses = {
      active: "Aktivan",
      inactive: "Neaktivan",
      suspended: "Suspendiran",
    };
    return statuses[status] || status;
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
          Moj profil
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Pregled vaših podataka i postavki
        </Typography>
      </Box>

      {/* Profile Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: ACCENT_COLOR,
                fontSize: "2.5rem",
                fontWeight: 600,
              }}
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Avatar>
            <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
              <Chip
                label={getRoleLabel(user.role)}
                color='primary'
                size='small'
              />
              <Chip
                label={getStatusLabel(user.status)}
                color={getStatusColor(user.status)}
                size='small'
                variant='outlined'
              />
            </Stack>
          </Box>

          {/* Basic Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
              {user.firstName} {user.lastName}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoItem
                  icon={<EmailIcon />}
                  label='Email'
                  value={user.email}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoItem
                  icon={<PhoneIcon />}
                  label='Telefon'
                  value={user.phone || "-"}
                />
              </Grid>
              {referee?.licenseNumber && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    icon={<BadgeIcon />}
                    label='Broj licence'
                    value={referee.licenseNumber}
                  />
                </Grid>
              )}
              {referee?.category && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    icon={<SoccerIcon />}
                    label='Kategorija'
                    value={referee.category}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Paper>

      {/* Statistics */}
      {stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            Statistika
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatBox
                icon={<SoccerIcon />}
                label='Ukupno utakmica'
                value={stats.totalMatches || 0}
                color={ACCENT_COLOR}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatBox
                icon={<TrophyIcon />}
                label='Ova sezona'
                value={stats.matchesThisSeason || 0}
                color='#22c55e'
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatBox
                icon={<CalendarIcon />}
                label='Ovaj mjesec'
                value={stats.matchesThisMonth || 0}
                color='#3b82f6'
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatBox
                icon={<PersonIcon />}
                label='Glavni sudac'
                value={stats.headRefereeCount || 0}
                color='#8b5cf6'
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Security */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
          Sigurnost
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "action.hover" }}>
              <LockIcon color='action' />
            </Avatar>
            <Box>
              <Typography variant='subtitle2'>Lozinka</Typography>
              <Typography variant='body2' color='text.secondary'>
                Promijenite vašu lozinku za pristup
              </Typography>
            </Box>
          </Box>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={() => setPasswordDialogOpen(true)}
          >
            Promijeni
          </Button>
        </Box>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !passwordLoading && setPasswordDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Promjena lozinke</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {passwordError && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}

            <TextField
              fullWidth
              label='Trenutna lozinka'
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      edge='end'
                    >
                      {showPasswords.current ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label='Nova lozinka'
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      edge='end'
                    >
                      {showPasswords.new ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label='Potvrdi novu lozinku'
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      edge='end'
                    >
                      {showPasswords.confirm ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            disabled={passwordLoading}
          >
            Odustani
          </Button>
          <Button
            variant='contained'
            onClick={handlePasswordChange}
            disabled={passwordLoading}
          >
            {passwordLoading ? "Spremanje..." : "Spremi"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Info Item Component
const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
    <Avatar sx={{ bgcolor: "action.hover", width: 36, height: 36 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2' fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// Stat Box Component
const StatBox = ({ icon, label, value, color }) => (
  <Box
    sx={{
      textAlign: "center",
      p: 2,
      borderRadius: 2,
      bgcolor: `${color}10`,
      border: `1px solid ${color}30`,
    }}
  >
    <Avatar
      sx={{
        bgcolor: `${color}20`,
        color,
        mx: "auto",
        mb: 1,
      }}
    >
      {icon}
    </Avatar>
    <Typography variant='h5' fontWeight={600} color={color}>
      {value}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
  </Box>
);

export default ProfilePage;
