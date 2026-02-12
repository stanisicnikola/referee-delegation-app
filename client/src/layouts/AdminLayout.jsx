import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  useMediaQuery,
  ThemeProvider,
  Chip,
  Paper,
  Popover,
} from "@mui/material";
import {
  VerifiedUser as AdminIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as RefereeIcon,
  Groups as GroupsIcon,
  EmojiEvents as CompetitionIcon,
  Event as MatchIcon,
  Groups3 as TeamsIcon,
  LocationOn as VenueIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon,
  History as AuditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";
import { adminTheme } from "../theme";
import { useUsers, useReferees } from "../hooks";

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const isMobile = useMediaQuery(adminTheme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // Fetch counts for sidebar badges
  const { data: usersData } = useUsers();
  const { data: refereesData } = useReferees();
  const delegates = usersData?.data?.filter((user) => user.role === "delegate");

  const userCount = usersData?.pagination?.total || 0;
  const refereeCount = refereesData?.pagination?.total || 0;
  const delegatesCount = delegates?.length || 0;

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "New referee registered",
      message: "Marko Marković has been added to the system",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Match needs delegation",
      message: "KK Bosna vs KK Čelik - Dec 28, 2025",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "System update",
      message: "New features available in the dashboard",
      time: "2 hours ago",
      read: true,
    },
  ];

  const menuSections = [
    {
      title: "OVERVIEW",
      items: [
        { title: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          title: "Users",
          path: "/admin/users",
          icon: PeopleIcon,
          count: userCount,
        },
        {
          title: "Referees",
          path: "/admin/referees",
          icon: RefereeIcon,
          count: refereeCount,
        },
        {
          title: "Delegates",
          path: "/admin/delegates",
          icon: GroupsIcon,
          count: delegatesCount,
        },
      ],
    },
    {
      title: "COMPETITIONS",
      items: [
        { title: "Matches", path: "/admin/matches", icon: MatchIcon },
        {
          title: "Leagues",
          path: "/admin/competitions",
          icon: CompetitionIcon,
        },
        { title: "Teams", path: "/admin/teams", icon: TeamsIcon },
        { title: "Venues", path: "/admin/venues", icon: VenueIcon },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { title: "Settings", path: "/admin/settings", icon: SettingsIcon },
      ],
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}. ${month} ${year}`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />;
      case "warning":
        return <WarningIcon sx={{ color: "#f59e0b", fontSize: 20 }} />;
      case "info":
        return <InfoIcon sx={{ color: "#3b82f6", fontSize: 20 }} />;
      default:
        return <InfoIcon sx={{ color: "#6b7280", fontSize: 20 }} />;
    }
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#121214",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AdminIcon sx={{ color: "white", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant='subtitle1'
            fontWeight={700}
            sx={{ lineHeight: 1.2 }}
          >
            RefDelegate
          </Typography>
          <Typography
            variant='caption'
            sx={(theme) => ({ color: theme.palette.primary.main })}
          >
            Admin Panel
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
        {menuSections.map((section) => (
          <Box key={section.title} sx={{ mb: 1 }}>
            <Typography
              variant='caption'
              sx={{
                px: 3,
                py: 1,
                display: "block",
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
              }}
            >
              {section.title}
            </Typography>
            <List sx={{ px: 1.5, py: 0 }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        bgcolor: isActive
                          ? "rgba(139, 92, 246, 0.15)"
                          : "transparent",
                        color: isActive ? "#8b5cf6" : "text.secondary",
                        "&:hover": {
                          bgcolor: isActive
                            ? "rgba(139, 92, 246, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                          color: isActive ? "#8b5cf6" : "text.primary",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? "#8b5cf6" : "inherit",
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.875rem",
                        }}
                      />
                      {item.count !== undefined && item.count > 0 && (
                        <Chip
                          label={item.count}
                          size='small'
                          sx={{
                            height: 22,
                            minWidth: 28,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            bgcolor: isActive
                              ? "rgba(139, 92, 246, 0.3)"
                              : "rgba(107, 114, 128, 0.3)",
                            color: isActive ? "#a78bfa" : "text.secondary",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User section */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            cursor: "pointer",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.05)",
            },
          }}
          onClick={handleMenuOpen}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
              noWrap
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant='caption'
              sx={{ color: "text.secondary", textTransform: "capitalize" }}
            >
              {user?.role}
            </Typography>
          </Box>
          <IconButton size='small' sx={{ color: "text.secondary" }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0a0b" }}>
        {/* Sidebar */}
        <Box
          component='nav'
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
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
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant='permanent'
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                border: "none",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content */}
        <Box
          component='main'
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar */}
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

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Date */}
                <Typography
                  variant='body2'
                  sx={{
                    color: "text.secondary",
                    display: { xs: "none", sm: "block" },
                    fontWeight: 500,
                  }}
                >
                  {getCurrentDate()}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Notification Popover */}
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 360,
                maxHeight: 400,
                bgcolor: "#1a1a1d",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              },
            }}
          >
            <Box
              sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant='subtitle1' fontWeight={600}>
                  Notifications
                </Typography>
                <IconButton size='small' onClick={handleNotificationClose}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {notifications.map((notification, index) => (
                <Box
                  key={notification.id}
                  sx={{
                    p: 2,
                    display: "flex",
                    gap: 1.5,
                    borderBottom:
                      index < notifications.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    bgcolor: notification.read
                      ? "transparent"
                      : "rgba(139, 92, 246, 0.05)",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                    },
                  }}
                >
                  <Box sx={{ pt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='body2'
                      fontWeight={600}
                      sx={{ mb: 0.25 }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {notification.time}
                    </Typography>
                  </Box>
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#8b5cf6",
                        mt: 0.75,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
            <Box
              sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}
            >
              <Typography
                variant='body2'
                sx={{
                  color: "primary.main",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                View all notifications
              </Typography>
            </Box>
          </Popover>

          {/* Page content */}
          <Box sx={{ p: { xs: 2, md: 4 }, flex: 1 }}>
            <Outlet />
          </Box>
        </Box>

        {/* User menu */}
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
              borderColor: "divider",
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='Profile' />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/admin/settings");
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='Settings' />
          </MenuItem>
          <Divider />
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

export default AdminLayout;
