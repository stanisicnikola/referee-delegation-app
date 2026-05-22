import { Box } from "@mui/material";
import StatCard from "./StatCard";

const StatsGrid = ({
  stats = [],
  loading = false,
  columns = 4,
  centered = false,
  cardSx = {},
  valueSx = {},
  labelSx = {},
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: `repeat(${columns}, minmax(0, 1fr))`,
        },
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 2.5, md: 3 },
        minWidth: 0,
      }}
    >
      {loading
        ? Array.from({ length: columns }).map((_, index) => (
            <StatCard
              key={index}
              loading={true}
              centered={centered}
              cardSx={cardSx}
              valueSx={valueSx}
              labelSx={labelSx}
            />
          ))
        : stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              centered={centered}
              cardSx={cardSx}
              valueSx={valueSx}
              labelSx={labelSx}
            />
          ))}
    </Box>
  );
};

export default StatsGrid;
