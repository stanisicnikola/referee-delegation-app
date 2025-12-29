import { Box, Typography, Skeleton } from "@mui/material";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "primary",
  loading = false,
}) => {
  const colorMap = {
    primary: {
      bg: "rgba(139, 92, 246, 0.1)",
      icon: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    },
    success: {
      bg: "rgba(34, 197, 94, 0.1)",
      icon: "#22c55e",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
    },
    warning: {
      bg: "rgba(249, 115, 22, 0.1)",
      icon: "#f97316",
      gradient: "linear-gradient(135deg, #f97316, #ea580c)",
    },
    error: {
      bg: "rgba(239, 68, 68, 0.1)",
      icon: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.1)",
      icon: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Skeleton variant='text' width={80} height={20} />
          <Skeleton variant='circular' width={40} height={40} />
        </Box>
        <Skeleton variant='text' width={60} height={36} />
        <Skeleton variant='text' width={100} height={16} sx={{ mt: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          variant='body2'
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {title}
        </Typography>
        {Icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: colors.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: colors.icon, fontSize: 20 }} />
          </Box>
        )}
      </Box>

      <Typography variant='h4' sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>

      {(trend !== undefined || trendLabel) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {trend !== undefined && (
            <Typography
              variant='caption'
              sx={{
                color: trend >= 0 ? "success.main" : "error.main",
                fontWeight: 600,
              }}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </Typography>
          )}
          {trendLabel && (
            <Typography variant='caption' sx={{ color: "text.secondary" }}>
              {trendLabel}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
