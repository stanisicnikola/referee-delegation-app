import { Box, Button, Paper, Typography } from "@mui/material";
import { SportsBasketball as BasketballIcon } from "@mui/icons-material";
import MatchRow from "./MatchRow";
import { DASHBOARD_COLORS as COLORS } from "./constants";

const UpcomingMatchesCard = ({ assignments, onViewAll, onPending }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
      minHeight: 410,
    }}
  >
    <Box
      sx={{
        px: { xs: 2.25, md: 3 },
        py: 2.25,
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
        Upcoming Matches
      </Typography>
      <Button
        onClick={onViewAll}
        sx={{
          color: COLORS.orange,
          textTransform: "none",
          fontWeight: 800,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "rgba(249, 115, 22, 0.08)" },
        }}
      >
        View all {">"}
      </Button>
    </Box>

    {assignments.length === 0 ? (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
        }}
      >
        <BasketballIcon sx={{ fontSize: 54, color: COLORS.muted, mb: 1.5 }} />
        <Typography sx={{ color: COLORS.text, fontWeight: 700 }}>
          No upcoming matches
        </Typography>
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.5 }}>
          New assignments will appear here when they are delegated.
        </Typography>
      </Box>
    ) : (
      <Box>
        {assignments.map((assignment, index) => (
          <MatchRow
            key={assignment.id || index}
            assignment={assignment}
            isLast={index === assignments.length - 1}
            onPending={onPending}
          />
        ))}
      </Box>
    )}
  </Paper>
);

export default UpcomingMatchesCard;
