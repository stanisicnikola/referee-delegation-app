import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { formatPanelHeaderDate } from "../../utils/dateFormatters";
import { PANEL_APP_BAR_SX, PANEL_TOOLBAR_SX } from "./panelLayoutConstants";

const PanelTopBar = ({ onMenuClick }) => (
  <AppBar position='sticky' elevation={0} sx={PANEL_APP_BAR_SX}>
    <Toolbar sx={PANEL_TOOLBAR_SX}>
      {onMenuClick && (
        <IconButton
          color='inherit'
          edge='start'
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <CalendarIcon sx={{ color: "text.secondary", fontSize: 24 }} />
        <Typography
          variant='body2'
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
        >
          {formatPanelHeaderDate()}
        </Typography>
      </Box>
    </Toolbar>
  </AppBar>
);

export default PanelTopBar;
