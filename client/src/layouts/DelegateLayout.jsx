import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  useMediaQuery,
  ThemeProvider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CalendarMonth as MatchesIcon,
  Person as RefereesIcon,
  EmojiEvents as CompetitionsIcon,
  Groups3 as TeamsIcon,
  Public as LogoIcon,
  EventBusy as AvailabilityIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";
import { delegateTheme as theme } from "../theme";
import PanelMobileDrawerHeader from "./shared/PanelMobileDrawerHeader";
import PanelSidebar from "./shared/PanelSidebar";
import PanelTopBar from "./shared/PanelTopBar";
import PanelUserMenu from "./shared/PanelUserMenu";
import {
  PANEL_DRAWER_PAPER_SX,
  PANEL_SIDEBAR_WIDTH,
} from "./shared/panelLayoutConstants";

const DRAWER_WIDTH = PANEL_SIDEBAR_WIDTH;

const DelegateLayout = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setAnchorEl(null);
  }, [isMobile]);

  const handleLogout = () => {
    handleDrawerClose();
    logout();
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerClose();
    }
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

  const sidebarContent = (
    <PanelSidebar
      brand={{
        subtitle: "Delegate Panel",
        icon: LogoIcon,
        iconBackground: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      }}
      sections={[{ items: navItems }]}
      pathname={location.pathname}
      onNavigate={handleNavigation}
      accentColor={theme.palette.primary.main}
      userMenu={{
        user,
        roleLabel: user?.role,
        onMenuOpen: handleMenuOpen,
        onLogout: handleLogout,
        avatarBackground: "linear-gradient(135deg, #f4931c 0%, #f87016 100%)",
      }}
    />
  );

  return (
    <ThemeProvider theme={theme}>
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
            onClose={handleDrawerClose}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": PANEL_DRAWER_PAPER_SX,
            }}
          >
            <PanelMobileDrawerHeader onClose={handleDrawerClose} />
            <Box sx={{ flex: 1, minHeight: 0 }}>{sidebarContent}</Box>
          </Drawer>

          <Drawer
            variant='permanent'
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": PANEL_DRAWER_PAPER_SX,
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
          <PanelTopBar onMenuClick={handleDrawerOpen} />

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

        <PanelUserMenu
          anchorEl={anchorEl}
          basePath='/delegate'
          accentColor={theme.palette.primary.main}
          onClose={handleMenuClose}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
      </Box>
    </ThemeProvider>
  );
};

export default DelegateLayout;
