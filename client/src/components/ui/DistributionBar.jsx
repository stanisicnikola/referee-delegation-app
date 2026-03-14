import { Box, Typography } from "@mui/material";

const DistributionBar = ({ label, value, total, color = "#8b5cf6" }) => {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#fff" }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 8,
          bgcolor: "#242428",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            bgcolor: color,
            borderRadius: "4px",
            width: percentage + "%",
            transition: "width 0.5s ease",
          }}
        />
      </Box>
    </Box>
  );
};

export default DistributionBar;
