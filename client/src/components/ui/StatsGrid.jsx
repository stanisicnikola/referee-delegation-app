import { Box } from "@mui/material";
import StatCard from "./StatCard";

const StatsGrid = ({ stats = [], loading = false, columns = 4 }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          lg: `repeat(${columns}, 1fr)`,
        },
        gap: 2,
        mb: 3,
      }}
    >
      {loading
        ? Array.from({ length: columns }).map((_, index) => (
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
