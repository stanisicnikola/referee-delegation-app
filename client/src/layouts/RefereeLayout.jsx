import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer, useMediaQuery, ThemeProvider } from "@mui/material";
import {
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  AccessTime as ClockIcon,
  History as HistoryIcon,
  Sports as LogoIcon,
} from "@mui/icons-material";
import { useAuth } from "../context";
import { refereeTheme } from "../theme";
import {
  useMyAssignments,
  useMyPendingAssignments,
} from "../hooks/useReferees";
import PanelMobileDrawerHeader from "./shared/PanelMobileDrawerHeader";
import PanelSidebar from "./shared/PanelSidebar";
import PanelTopBar from "./shared/PanelTopBar";
import PanelUserMenu from "./shared/PanelUserMenu";
import {
  PANEL_DRAWER_PAPER_SX,
  PANEL_SIDEBAR_WIDTH,
} from "./shared/panelLayoutConstants";

const SIDEBAR_WIDTH = PANEL_SIDEBAR_WIDTH;
const SCHEDULE_BADGE_QUERY = {
  view: "schedule",
  period: "upcoming",
  limit: 1000,
};

const RefereeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(refereeTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { data: assignmentsData } = useMyAssignments(SCHEDULE_BADGE_QUERY);
  const { data: pendingAssignmentsData } = useMyPendingAssignments();

  useEffect(() => {
    setAnchorEl(null);
  }, [isMobile]);

  const scheduleBadgeCount = useMemo(() => {
    if (Array.isArray(assignmentsData?.data))
      return assignmentsData.data.length;

    return (assignmentsData?.groups || []).reduce(
      (count, group) => count + (group.matches?.length || 0),
      0,
    );
  }, [assignmentsData?.data, assignmentsData?.groups]);

  const pendingDelegationCount = pendingAssignmentsData?.data?.length || 0;

  const navItems = [
    {
      path: "/referee/dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      exact: true,
    },
    {
      path: "/referee/schedule",
      label: "My Schedule",
      icon: CalendarIcon,
      badge: scheduleBadgeCount,
      exact: true,
    },
    {
      path: "/referee/pending",
      label: "Pending",
      icon: AssignmentIcon,
      badge: pendingDelegationCount || null,
      badgeColor: "#eab308",
      badgePulse: pendingDelegationCount > 0,
      exact: true,
    },
    {
      path: "/referee/availability",
      label: "Availability",
      icon: ClockIcon,
      exact: true,
    },
  ];

  const bottomNavItems = [
    {
      path: "/referee/history",
      label: "History",
      icon: HistoryIcon,
      exact: true,
    },
  ];

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
    if (isMobile) handleDrawerClose();
  };

  const sidebarContent = (
    <PanelSidebar
      brand={{
        subtitle: "Referee Panel",
        icon: LogoIcon,
        iconBackground: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      }}
      sections={[{ items: navItems }]}
      bottomSections={[
        {
          items: bottomNavItems,
          divider: true,
        },
      ]}
      pathname={location.pathname}
      onNavigate={handleNavigation}
      accentColor={refereeTheme.palette.primary.main}
      userMenu={{
        user,
        roleLabel: `Category ${user?.referee?.licenseCategory || "N/A"}`,
        onMenuOpen: handleMenuOpen,
        onLogout: handleLogout,
        avatarBackground: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      }}
    />
  );

  return (
    <ThemeProvider theme={refereeTheme}>
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
          sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
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
            width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
            minHeight: 0,
            minWidth: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PanelTopBar onMenuClick={handleDrawerOpen} />

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              p: { xs: 2, md: 4 },
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
          basePath='/referee'
          accentColor={refereeTheme.palette.primary.main}
          onClose={handleMenuClose}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
      </Box>
    </ThemeProvider>
  );
};

export default RefereeLayout;
