import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/user/StatusBadge";
import { CustomButton, PageHeader } from "../../components/ui";

const AdminProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
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
              p: 4,
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
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
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
              p: 4,
              borderRadius: 2,
              bgcolor: "#111114",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, mb: 3, color: "white" }}
            >
              Account Information
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
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
                  sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
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
                  sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
                >
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant='caption'
                    sx={{ color: "text.secondary" }}
                  >
                    Email Address
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ color: "white", fontWeight: 500 }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
                >
                  <PhoneIcon />
                </Avatar>
                <Box>
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
                  alignItems: { xs: "flex-start", md: "center" },
                  flexDirection: { xs: "column", md: "row" },
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
                  <SecurityIcon sx={{ color: "#8b5cf6" }} />
                  <Typography variant='body2' sx={{ color: "text.secondary" }}>
                    Manage your account and preferences
                  </Typography>
                </Box>
                <CustomButton
                  variant='admin-outline'
                  size='small'
                  onClick={() => navigate("/admin/settings")}
                >
                  Go to Settings
                </CustomButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminProfilePage;
