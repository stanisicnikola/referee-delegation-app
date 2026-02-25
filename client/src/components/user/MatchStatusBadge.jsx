import { Box, Typography } from "@mui/material";
import {
  CheckCircle as InProgressIcon,
  Cancel as CancelledIcon,
  Warning as PostponedIcon,
  CalendarMonth as ScheduledIcon,
  DoneAll as CompletedIcon,
} from "@mui/icons-material";

const statusConfig = {
  completed: {
    label: "Completed",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "#f59e0b30",
    icon: CompletedIcon,
  },
  scheduled: {
    label: "Scheduled",
    color: "#3b82f6",
    bg: "rgba(68, 117, 239, 0.15)",
    border: "#3b82f630",
    icon: ScheduledIcon,
  },
  in_progress: {
    label: "In Progress",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#22c55e30",
    icon: InProgressIcon,
  },
  postponed: {
    label: "Postponed",
    color: "#df5f04",
    bg: "rgba(233, 107, 61, 0.15)",
    border: "#df5f0430",
    icon: PostponedIcon,
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "#ef444430",
    icon: CancelledIcon,
  },
};

const MatchStatusBadge = ({ status = "scheduled", scheduledAt }) => {
  let displayStatus = status;

  if (status === "scheduled" && scheduledAt) {
    const isPast = new Date(scheduledAt) <= new Date();
    if (isPast) {
      displayStatus = "in_progress";
    }
  }

  const config = statusConfig[displayStatus] || statusConfig.scheduled;
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
        sx={{
          fontSize: "12px",
          fontWeight: 500,
          color: config.color,
        }}
      >
        {config.label}
      </Typography>
    </Box>
  );
};

export default MatchStatusBadge;
