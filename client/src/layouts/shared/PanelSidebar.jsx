import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SidebarUserMenu from "../../components/ui/SidebarUserMenu";
import { PANEL_BORDER, PANEL_HEADER_HEIGHT } from "./panelLayoutConstants";

const DEFAULT_USER_MENU_SX = {
  row: {
    borderRadius: "8px",
    transition: "all 0.2s",
    "&:hover": { bgcolor: "#1a1a1d" },
  },
  avatar: {
    width: 40,
    height: 40,
    fontSize: "14px",
  },
  nameText: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  roleText: {
    fontSize: "12px",
    color: "#6b7280",
  },
  logoutButton: {
    color: "#6b7280",
  },
};

const isActiveRoute = (item, pathname) => {
  if (item.exact) return pathname === item.path;
  return pathname.startsWith(item.path);
};

const SidebarBrand = ({ brand, accentColor }) => {
  const LogoIcon = brand.icon;

  return (
    <Box
      sx={{
        height: PANEL_HEADER_HEIGHT,
        boxSizing: "border-box",
        px: 3,
        borderBottom: PANEL_BORDER,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: brand.iconBackground,
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
          <Typography variant='caption' sx={{ color: accentColor }}>
            {brand.subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const SidebarCountBadge = ({ value, active, accentColor }) => (
  <Chip
    label={value}
    size='small'
    sx={{
      height: 22,
      minWidth: 28,
      fontSize: "0.75rem",
      fontWeight: 600,
      bgcolor: active ? alpha(accentColor, 0.3) : "rgba(107, 114, 128, 0.3)",
      color: active ? accentColor : "text.secondary",
    }}
  />
);

const SidebarBadge = ({ item, accentColor }) => {
  const color = item.badgeColor || accentColor;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {item.badgePulse && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "999px",
            bgcolor: color,
            animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
            opacity: 0.7,
            "@keyframes ping": {
              "75%, 100%": {
                transform: "scale(1.6)",
                opacity: 0,
              },
            },
          }}
        />
      )}
      <Box
        sx={{
          position: "relative",
          minWidth: 22,
          height: 22,
          px: 0.75,
          borderRadius: "999px",
          bgcolor: alpha(color, 0.18),
          color,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {item.badge}
      </Box>
    </Box>
  );
};

const SidebarNavItem = ({ item, active, accentColor, onNavigate }) => {
  const ItemIcon = item.icon;
  const count = Number(item.count);
  const badge = Number(item.badge);

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={() => onNavigate(item.path)}
        sx={{
          m: 0,
          py: 1.5,
          px: 2,
          borderRadius: "8px",
          color: active ? accentColor : "#9ca3af",
          bgcolor: active ? alpha(accentColor, 0.16) : "transparent",
          "&:hover": {
            bgcolor: active ? alpha(accentColor, 0.22) : "#1a1a1d",
            color: active ? accentColor : "#fff",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: active ? accentColor : "inherit",
          }}
        >
          <ItemIcon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText
          primary={item.label || item.title}
          sx={{ my: 0, flex: 1 }}
          primaryTypographyProps={{
            fontWeight: active ? 600 : 500,
            fontSize: "0.875rem",
          }}
        />
        {count > 0 && (
          <SidebarCountBadge
            value={item.count}
            active={active}
            accentColor={accentColor}
          />
        )}
        {!count && badge > 0 && (
          <SidebarBadge item={item} accentColor={accentColor} />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const SidebarSection = ({ section, pathname, accentColor, onNavigate }) => (
  <Box
    sx={{
      mb: section.title ? 1 : 0,
      ...(section.divider && {
        mt: 4,
        pt: 4,
        borderTop: PANEL_BORDER,
      }),
    }}
  >
    {section.title && (
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
    )}
    <List sx={{ px: 0, py: 0 }}>
      {section.items.map((item) => (
        <SidebarNavItem
          key={item.path}
          item={item}
          active={isActiveRoute(item, pathname)}
          accentColor={accentColor}
          onNavigate={onNavigate}
        />
      ))}
    </List>
  </Box>
);

const SidebarFooter = ({ userMenu }) => {
  if (!userMenu) return null;

  return (
    <Box sx={{ p: 2, borderTop: PANEL_BORDER }}>
      <SidebarUserMenu
        user={userMenu.user}
        roleLabel={userMenu.roleLabel}
        onMenuOpen={userMenu.onMenuOpen}
        onLogout={userMenu.onLogout}
        rowSx={DEFAULT_USER_MENU_SX.row}
        avatarSx={{
          ...DEFAULT_USER_MENU_SX.avatar,
          ...(userMenu.avatarBackground && {
            background: userMenu.avatarBackground,
          }),
        }}
        nameTextSx={DEFAULT_USER_MENU_SX.nameText}
        roleTextSx={DEFAULT_USER_MENU_SX.roleText}
        logoutButtonSx={DEFAULT_USER_MENU_SX.logoutButton}
      />
    </Box>
  );
};

const PanelSidebar = ({
  brand,
  sections,
  bottomSections = [],
  pathname,
  onNavigate,
  accentColor,
  userMenu,
}) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "#121214",
    }}
  >
    <SidebarBrand brand={brand} accentColor={accentColor} />
    <Box component='nav' sx={{ flex: 1, overflow: "auto", p: 2 }}>
      {[...sections, ...bottomSections].map((section, index) => (
        <SidebarSection
          key={section.title || index}
          section={section}
          pathname={pathname}
          accentColor={accentColor}
          onNavigate={onNavigate}
        />
      ))}
    </Box>
    <SidebarFooter userMenu={userMenu} />
  </Box>
);

export default PanelSidebar;
