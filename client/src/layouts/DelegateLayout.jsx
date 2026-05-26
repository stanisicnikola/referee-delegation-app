import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  ThemeProvider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CalendarMonth as MatchesIcon,
  Person as RefereesIcon,
  EmojiEvents as CompetitionsIcon,
  Groups3 as TeamsIcon,
  Settings as SettingsIcon,
  Public as LogoIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  CalendarMonth as CalendarIcon,
  EventBusy as AvailabilityIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";
import SidebarUserMenu from "../components/ui/SidebarUserMenu";
import { delegateTheme } from "../theme";

const DRAWER_WIDTH = 256;

const DelegateLayout = () => {
  const isMobile = useMediaQuery(delegateTheme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    handleMenuClose();
    setMobileOpen(false);
    logout();
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
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
    {
      path: "/delegate/availability",
      icon: AvailabilityIcon,
      label: "Unavailability Requests",
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}. ${month} ${year}`;
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#121214",
      }}
    >
      <Box
        sx={{
          p: 2.7,
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
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
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
                <Typography sx={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>
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

      <Box sx={{ p: 2, borderTop: "1px solid #242428" }}>
        <SidebarUserMenu
          user={user}
          roleLabel={user?.role}
          onMenuOpen={handleMenuOpen}
          onLogout={handleLogout}
          rowSx={{
            borderRadius: "8px",
            transition: "all 0.2s",
            "&:hover": { bgcolor: "#1a1a1d" },
          }}
          avatarSx={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, #f4931c 0%, #f87016 100%)",
            fontSize: "14px",
          }}
          nameTextSx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          roleTextSx={{ fontSize: "12px", color: "#6b7280" }}
          logoutButtonSx={{ color: "#6b7280" }}
        />
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={delegateTheme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "#0a0a0b",
        }}
      >
        <Box
          component='nav'
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant='temporary'
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                border: "none",
                borderRight: "1px solid #242428",
              },
            }}
          >
            {sidebarContent}
          </Drawer>

          <Drawer
            variant='permanent'
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                border: "none",
                borderRight: "1px solid #242428",
              },
            }}
            open
          >
            {sidebarContent}
          </Drawer>
        </Box>

        <Box
          component='main'
          sx={{
            flexGrow: 1,
            width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
            height: "100vh",
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppBar
            position='sticky'
            elevation={0}
            sx={{
              bgcolor: "#0a0a0b",
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1.2,
            }}
          >
            <Toolbar
              sx={{ px: { xs: 2, md: 4 }, justifyContent: "space-between" }}
            >
              <IconButton
                color='inherit'
                edge='start'
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarIcon sx={{ color: "text.secondary" }} />
                <Typography
                  variant='body2'
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {getCurrentDate()}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>

          <Box
            sx={{
              p: { xs: 2, md: 4 },
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              width: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarGutter: "stable",
            }}
          >
            <Outlet />
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "left", vertical: "bottom" }}
          anchorOrigin={{ horizontal: "left", vertical: "top" }}
          PaperProps={{
            sx: {
              mt: -1,
              minWidth: 200,
              bgcolor: "#1a1a1d",
              border: "1px solid",
              borderColor: "#242428",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setMobileOpen(false);
              navigate("/delegate/profile");
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize='small' sx={{ color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText primary='Profile' />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setMobileOpen(false);
              navigate("/delegate/settings");
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize='small' sx={{ color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText primary='Settings' />
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <LogoutIcon fontSize='small' sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText primary='Logout' />
          </MenuItem>
        </Menu>
      </Box>
    </ThemeProvider>
  );
};

export default DelegateLayout;
