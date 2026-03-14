import { Box, Typography } from "@mui/material";
import {
  Add as AddIcon,
  Login as LoginIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  SportsBasketball as MatchIcon,
} from "@mui/icons-material";

const activityConfig = {
  delegation: {
    icon: AddIcon,
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  match: {
    icon: MatchIcon,
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
  },
  user: {
    icon: PersonAddIcon,
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  login: {
    icon: LoginIcon,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  update: {
    icon: EditIcon,
    color: "#eab308",
    bgColor: "rgba(234, 179, 8, 0.1)",
  },
};

const ActivityFeed = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
          No recent activities
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {items.map((activity, index) => {
        const config = activityConfig[activity.type] || activityConfig.update;
        const Icon = config.icon;

        return (
          <Box
            key={activity.id}
            sx={{
              p: 2,
              px: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom:
                index < items.length - 1 ? "1px solid #242428" : "none",
              borderLeft: "3px solid " + config.color,
              transition: "background 0.15s ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: config.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 20, color: config.color }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.25 }}>
                {activity.title}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }} noWrap>
                {activity.description}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "12px",
                color: "#6b7280",
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {activity.time}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActivityFeed;
