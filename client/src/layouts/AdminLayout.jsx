import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Drawer, useMediaQuery, ThemeProvider } from "@mui/material";
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
} from "@mui/icons-material";
import { useAuth } from "../context";
import { adminTheme } from "../theme";
import { useRefereesStatistics, useUserStatistics } from "../hooks";
import PanelMobileDrawerHeader from "./shared/PanelMobileDrawerHeader";
import PanelSidebar from "./shared/PanelSidebar";
import PanelTopBar from "./shared/PanelTopBar";
import PanelUserMenu from "./shared/PanelUserMenu";
import {
  PANEL_DRAWER_PAPER_SX,
  PANEL_SIDEBAR_WIDTH,
} from "./shared/panelLayoutConstants";

const DRAWER_WIDTH = PANEL_SIDEBAR_WIDTH;

const AdminLayout = () => {
  const isMobile = useMediaQuery(adminTheme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setAnchorEl(null);
  }, [isMobile]);

  const { data: usersStatisticsData } = useUserStatistics();
  const { data: refereesStatisticsData } = useRefereesStatistics();
  const userStats = usersStatisticsData?.data || {};
  const refereeStats = refereesStatisticsData?.data || {};

  const userCount = userStats.total || 0;
  const refereeCount = refereeStats.total || 0;
  const delegatesCount = userStats.byRole?.delegates || 0;

  const menuSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          title: "Dashboard",
          path: "/admin/dashboard",
          icon: DashboardIcon,
          exact: true,
        },
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
          exact: true,
        },
        {
          title: "Referees",
          path: "/admin/referees",
          icon: RefereeIcon,
          count: refereeCount,
          exact: true,
        },
        {
          title: "Delegates",
          path: "/admin/delegates",
          icon: GroupsIcon,
          count: delegatesCount,
          exact: true,
        },
      ],
    },
    {
      title: "COMPETITIONS",
      items: [
        {
          title: "Matches",
          path: "/admin/matches",
          icon: MatchIcon,
          exact: true,
        },
        {
          title: "Leagues",
          path: "/admin/competitions",
          icon: CompetitionIcon,
          exact: true,
        },
        {
          title: "Teams",
          path: "/admin/teams",
          icon: TeamsIcon,
          exact: true,
        },
        {
          title: "Venues",
          path: "/admin/venues",
          icon: VenueIcon,
          exact: true,
        },
      ],
    },
  ];

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleDrawerClose();
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerClose();
    }
  };

  const sidebarContent = (
    <PanelSidebar
      brand={{
        subtitle: "Admin Panel",
        icon: AdminIcon,
        iconBackground: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      }}
      sections={menuSections}
      pathname={location.pathname}
      onNavigate={handleNavigation}
      accentColor='#8b5cf6'
      userMenu={{
        user,
        roleLabel: user?.role,
        onMenuOpen: handleMenuOpen,
        onLogout: handleLogout,
        avatarBackground: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
      }}
    />
  );

  return (
    <ThemeProvider theme={adminTheme}>
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
          basePath='/admin'
          accentColor={adminTheme.palette.primary.main}
          onClose={handleMenuClose}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
