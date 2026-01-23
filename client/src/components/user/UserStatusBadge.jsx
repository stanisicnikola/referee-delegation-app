import { Box, Typography } from "@mui/material";
import {
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as SuspendedIcon,
} from "@mui/icons-material";

const statusConfig = {
  active: {
    label: "Active",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#22c55e30",
    icon: ActiveIcon,
  },
  inactive: {
    label: "Inactive",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "#ef444430",
    icon: InactiveIcon,
  },
  suspended: {
    label: "Suspended",
    color: "#df5f04dd",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "#df5f04dd",
    icon: SuspendedIcon,
  },
};

const UserStatusBadge = ({ status = "inactive" }) => {
  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: "10px",
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon sx={{ fontSize: 12, color: config.color }} />
      <Typography
        sx={{ fontSize: "12px", fontWeight: 500, color: config.color }}
      >
        {config.label}
      </Typography>
    </Box>
  );
};

export default UserStatusBadge;
