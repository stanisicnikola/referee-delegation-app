import { Box, Typography, Skeleton } from "@mui/material";

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "#8b5cf6",
  loading = false,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          minWidth: 0,
        }}
      >
        <Skeleton
          variant='rectangular'
          width={44}
          height={44}
          sx={{ borderRadius: "12px" }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant='text' width='60%' height={32} />
          <Skeleton variant='text' width='40%' height={20} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        bgcolor: "#121214",
        border: "1px solid #242428",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        gap: { xs: 1.5, sm: 2 },
        minWidth: 0,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#3f3f46",
          bgcolor: "#161618",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: "12px",
            bgcolor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 24, color: color }} />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: "22px", sm: "24px" },
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatCard;
