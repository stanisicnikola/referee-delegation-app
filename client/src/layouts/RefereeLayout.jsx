import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  AccessTime as ClockIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";

const SIDEBAR_WIDTH = 256;

const RefereeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/referee/dashboard", label: "Dashboard", icon: HomeIcon },
    {
      path: "/referee/schedule",
      label: "My Schedule",
      icon: CalendarIcon,
      badge: 3,
    },
    {
      path: "/referee/pending",
      label: "Pending",
      icon: AssignmentIcon,
      pulse: true,
    },
    { path: "/referee/availability", label: "Availability", icon: ClockIcon },
    {
      path: "/referee/notifications",
      label: "Notifications",
      icon: NotificationsIcon,
      badge: 2,
      badgeColor: "#ef4444",
    },
  ];

  const bottomNavItems = [
    { path: "/referee/history", label: "History", icon: HistoryIcon },
    { path: "/referee/profile", label: "My Profile", icon: PersonIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        bgcolor: "#121214",
        borderRight: "1px solid #242428",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: "1px solid #242428" }}>
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
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='white'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10M12 2c-2.5 2.5-4 6-4 10s1.5 7.5 4 10' />
            </svg>
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "18px", color: "#fff" }}
            >
              RefDelegate
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
              Referee Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Box
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: active ? "#fff" : "#9ca3af",
                  bgcolor: active ? "#242428" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": {
                    bgcolor: "#242428",
                    color: "#fff",
                  },
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontWeight: 500, fontSize: "14px", flex: 1 }}>
                  {item.label}
                </Typography>
                {item.badge && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: "10px",
                      bgcolor: item.badgeColor
                        ? `${item.badgeColor}20`
                        : "rgba(249, 115, 22, 0.2)",
                      color: item.badgeColor || "#f97316",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
                {item.pulse && (
                  <Box sx={{ position: "relative", width: 8, height: 8 }}>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        bgcolor: "#eab308",
                        animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
                        opacity: 0.75,
                        "@keyframes ping": {
                          "75%, 100%": {
                            transform: "scale(2)",
                            opacity: 0,
                          },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "relative",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#eab308",
                      }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Bottom Nav Items */}
        <Box
          sx={{
            mt: 4,
            pt: 4,
            borderTop: "1px solid #242428",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Box
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: active ? "#fff" : "#9ca3af",
                  bgcolor: active ? "#242428" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": {
                    bgcolor: "#242428",
                    color: "#fff",
                  },
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* User Section */}
      <Box sx={{ p: 2, borderTop: "1px solid #242428" }}>
        <Box
          onClick={() => handleNavigation("/referee/profile")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s",
            "&:hover": { bgcolor: "#242428" },
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {getInitials()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "14px",
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
              Category {user?.referee?.licenseCategory || "N/A"}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#22c55e",
            }}
            title='Available'
          />
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
            cursor: "pointer",
            color: "#9ca3af",
            transition: "all 0.15s",
            "&:hover": { bgcolor: "#242428", color: "#ef4444" },
          }}
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
            Logout
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0a0b" }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            bgcolor: "#121214",
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            px: 2,
            zIndex: 1200,
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ color: "#fff" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ ml: 2, fontWeight: 600, color: "#fff" }}>
            RefDelegate
          </Typography>
        </Box>
      )}

      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 50,
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Sidebar - Mobile Drawer */}
      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            bgcolor: "#121214",
            borderRight: "1px solid #242428",
          },
        }}
      >
        <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{ color: "#9ca3af" }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          mt: { xs: "56px", md: 0 },
          minHeight: { xs: "calc(100vh - 56px)", md: "100vh" },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default RefereeLayout;
