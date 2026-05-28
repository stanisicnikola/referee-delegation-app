import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/user/StatusBadge";
import { CustomButton, PageHeader } from "../components/ui";
import ProfileEditDialog from "../components/profile/ProfileEditDialog";
import { useUpdateMe } from "../hooks/useAuthHooks";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateMe();
  const [editOpen, setEditOpen] = useState(false);
  const roleStyles = {
    admin: {
      basePath: "/admin",
      outlineVariant: "admin-outline",
      accent: "#8b5cf6",
      accentDark: "#7c3aed",
      accentSoft: "rgba(139, 92, 246, 0.1)",
    },
    delegate: {
      basePath: "/delegate",
      outlineVariant: "delegate-outline",
      accent: "#f97316",
      accentDark: "#ea580c",
      accentSoft: "rgba(249, 115, 22, 0.1)",
    },
    referee: {
      basePath: "/referee",
      outlineVariant: "referee-outline",
      accent: "#22c55e",
      accentDark: "#16a34a",
      accentSoft: "rgba(34, 197, 94, 0.1)",
    },
  };
  const roleStyle = roleStyles[user?.role] || roleStyles.admin;
  const isSavingProfile = updateProfile.isPending;

  const openEditProfile = () => setEditOpen(true);

  const closeEditProfile = () => {
    if (isSavingProfile) return;
    setEditOpen(false);
  };

  const handleSaveProfile = async (data) => {
    try {
      await updateProfile.mutateAsync(data);
      setEditOpen(false);
    } catch {
      // The mutation hook shows the API error toast.
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
        title='My Profile'
        subtitle='View and edit your profile information'
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Profile Card */}
        <Box>
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              bgcolor: "#111114",
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 2,
                background: `linear-gradient(135deg, ${roleStyle.accent}, ${roleStyle.accentDark})`,
                fontSize: "2.5rem",
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
            <Typography variant='h6' sx={{ fontWeight: 700, color: "white" }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: "text.secondary",
                mb: 2,
                textTransform: "capitalize",
              }}
            >
              {user?.role}
            </Typography>
            <StatusBadge status={user?.status} />
          </Paper>
        </Box>

        {/* Details and Info */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, sm: 4 },
              borderRadius: 2,
              bgcolor: "#111114",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: "white" }}
              >
                Account Information
              </Typography>
              <CustomButton
                variant={roleStyle.outlineVariant}
                size='small'
                onClick={openEditProfile}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Edit Profile
              </CustomButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{ bgcolor: roleStyle.accentSoft, color: roleStyle.accent }}
                >
                  <PersonIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    sx={{ color: "text.secondary" }}
                  >
                    First Name
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ color: "white", fontWeight: 500 }}
                  >
                    {user?.firstName}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{ bgcolor: roleStyle.accentSoft, color: roleStyle.accent }}
                >
                  <PersonIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    sx={{ color: "text.secondary" }}
                  >
                    Last Name
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ color: "white", fontWeight: 500 }}
                  >
                    {user?.lastName}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{ bgcolor: roleStyle.accentSoft, color: roleStyle.accent }}
                >
                  <EmailIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    sx={{ color: "text.secondary" }}
                  >
                    Email Address
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{ bgcolor: roleStyle.accentSoft, color: roleStyle.accent }}
                >
                  <PhoneIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    sx={{ color: "text.secondary" }}
                  >
                    Phone Number
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ color: "white", fontWeight: 500 }}
                  >
                    {user?.phone || "Not provided"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 5,
                p: 3,
                borderRadius: 2,
                bgcolor: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed rgba(255, 255, 255, 0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <SecurityIcon sx={{ color: roleStyle.accent }} />
                  <Typography variant='body2' sx={{ color: "text.secondary" }}>
                    Manage your account and preferences
                  </Typography>
                </Box>
                <CustomButton
                  variant={roleStyle.outlineVariant}
                  size='small'
                  onClick={() => navigate(`${roleStyle.basePath}/settings`)}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  Go to Settings
                </CustomButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Box>

      <ProfileEditDialog
        open={editOpen}
        user={user}
        onClose={closeEditProfile}
        onSubmit={handleSaveProfile}
        isLoading={isSavingProfile}
        submitVariant={roleStyle.outlineVariant}
        accentColor={roleStyle.accent}
      />
    </Box>
  );
};

export default ProfilePage;
