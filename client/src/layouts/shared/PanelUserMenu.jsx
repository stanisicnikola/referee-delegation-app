import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { PANEL_BORDER } from "./panelLayoutConstants";

const getPanelRoute = (basePath, route) =>
  `${basePath.replace(/\/$/, "")}/${route}`;

const createMenuItemSx = (accentColor) => ({
  color: "text.primary",
  "& .MuiListItemIcon-root": {
    minWidth: 36,
    color: "text.secondary",
  },
  "&:hover": {
    bgcolor: alpha(accentColor, 0.08),
  },
});

const logoutItemSx = (theme) => ({
  color: theme.palette.error.main,
  "& .MuiListItemIcon-root": {
    minWidth: 36,
    color: theme.palette.error.main,
  },
  "&:hover": {
    bgcolor: alpha(theme.palette.error.main, 0.08),
  },
});

const PanelUserMenu = ({
  anchorEl,
  basePath,
  accentColor,
  onClose,
  onNavigate,
  onLogout,
}) => {
  const handleNavigate = (route) => {
    onClose();
    onNavigate(getPanelRoute(basePath, route));
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      transformOrigin={{ horizontal: "left", vertical: "bottom" }}
      anchorOrigin={{ horizontal: "left", vertical: "top" }}
      slotProps={{
        paper: {
          sx: {
            mt: -1,
            minWidth: 200,
            bgcolor: "#1a1a1d",
            border: PANEL_BORDER,
          },
        },
      }}
    >
      <MenuItem
        onClick={() => handleNavigate("profile")}
        sx={createMenuItemSx(accentColor)}
      >
        <ListItemIcon>
          <PersonIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Profile' />
      </MenuItem>
      <MenuItem
        onClick={() => handleNavigate("settings")}
        sx={createMenuItemSx(accentColor)}
      >
        <ListItemIcon>
          <SettingsIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Settings' />
      </MenuItem>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />
      <MenuItem onClick={onLogout} sx={logoutItemSx}>
        <ListItemIcon>
          <LogoutIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Logout' />
      </MenuItem>
    </Menu>
  );
};

export default PanelUserMenu;
