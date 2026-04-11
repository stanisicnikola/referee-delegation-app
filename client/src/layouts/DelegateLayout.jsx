import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CalendarMonth as MatchesIcon,
  Person as RefereesIcon,
  EmojiEvents as CompetitionsIcon,
  Groups3 as TeamsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Public as LogoIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";

const DelegateLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      path: "/delegate/dashboard",
      icon: DashboardIcon,
      label: "Dashboard",
      exact: true,
    },
    {
      path: "/delegate/matches",
      icon: MatchesIcon,
      label: "Matches",
    },
    { path: "/delegate/referees", icon: RefereesIcon, label: "Referees" },
    {
      path: "/delegate/competitions",
      icon: CompetitionsIcon,
      label: "Competitions",
    },
    { path: "/delegate/teams", icon: TeamsIcon, label: "Teams" },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0a0b" }}>
      {/* Sidebar */}
      <Box
        component='aside'
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: 256,
          bgcolor: "#121214",
          borderRight: "1px solid #242428",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #242428",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogoIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                RefDelegate
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                Delegate Panel
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation */}
        <Box
          component='nav'
          sx={{
            flex: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    borderRadius: "8px",
                    color: active ? "#fff" : "#9ca3af",
                    bgcolor: active ? "#242428" : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: active ? "#242428" : "#1a1a1d",
                      color: "#fff",
                    },
                  }}
                >
                  <item.icon sx={{ fontSize: 20 }} />
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 500, flex: 1 }}
                  >
                    {item.label}
                  </Typography>
                  {item.badge && (
                    <Box
                      sx={{
                        bgcolor: "rgba(249, 115, 22, 0.2)",
                        color: "#f97316",
                        fontSize: "12px",
                        fontWeight: 600,
                        px: 1,
                        py: 0.25,
                        borderRadius: "9999px",
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </Box>
              </NavLink>
            );
          })}
        </Box>

        {/* User Section */}
        <Box sx={{ p: 2, borderTop: "1px solid #242428" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#1a1a1d" },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                Delegate
              </Typography>
            </Box>
            <Tooltip title='Settings'>
              <IconButton size='small' sx={{ color: "#6b7280" }}>
                <SettingsIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              mt: 1,
              borderRadius: "8px",
              color: "#9ca3af",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#1a1a1d", color: "#ef4444" },
            }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          ml: "256px",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DelegateLayout;
