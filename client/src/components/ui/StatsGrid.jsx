import { Box } from "@mui/material";
import StatCard from "./StatCard";

const StatsGrid = ({ stats = [], loading = false }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 2,
        mb: 3,
      }}
    >
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <StatCard key={index} loading={true} />
          ))
        : stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
    </Box>
  );
};

export default StatsGrid;
