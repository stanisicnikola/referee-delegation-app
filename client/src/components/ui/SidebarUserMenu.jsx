import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";

const SidebarUserMenu = ({
  user,
  roleLabel,
  onMenuOpen,
  onLogout,
  rowSx = {},
  avatarSx = {},
  nameTextSx = {},
  roleTextSx = {},
  logoutButtonSx = {},
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.05)",
        },
        ...rowSx,
      }}
      onClick={onMenuOpen}
    >
      <Avatar
        sx={{
          width: 38,
          height: 38,
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          fontSize: "0.85rem",
          fontWeight: 600,
          ...avatarSx,
        }}
      >
        {user?.firstName?.[0]}
        {user?.lastName?.[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant='body2'
          sx={{ fontWeight: 600, lineHeight: 1.2, ...nameTextSx }}
          noWrap
        >
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography
          variant='caption'
          sx={{ color: "text.secondary", textTransform: "capitalize", ...roleTextSx }}
        >
          {roleLabel || user?.role}
        </Typography>
      </Box>
      <IconButton
        size='small'
        sx={{
          color: (theme) => theme.palette.grey[400],
          "&:hover": {
            color: (theme) => theme.palette.error.main,
          },
          ...logoutButtonSx,
        }}
        onClick={(event) => {
          event.stopPropagation();
          onLogout();
        }}
      >
        <LogoutIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};

export default SidebarUserMenu;
