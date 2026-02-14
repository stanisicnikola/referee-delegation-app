import { Box, Typography } from "@mui/material";
import {
  Person as PersonIcon,
  Groups as GroupsIcon,
  VerifiedUser as AdminIcon,
} from "@mui/icons-material";

const RoleBadge = ({ role }) => {
  const config = {
    admin: {
      label: "Admin",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.15)",
      icon: AdminIcon,
    },
    delegate: {
      label: "Delegate",
      color: "#3b82f6",
      bg: "#3b82f626",
      icon: GroupsIcon,
    },
    referee: {
      label: "Referee",
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.15)",
      icon: PersonIcon,
    },
  };

  const { label, color, bg, icon: Icon } = config[role] || config.referee;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: "10px",
        bgcolor: bg,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon sx={{ fontSize: 14, color }} />
      <Typography sx={{ fontSize: "12px", fontWeight: 500, color }}>
        {label}
      </Typography>
    </Box>
  );
};

export default RoleBadge;
