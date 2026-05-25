import { Box, Paper, Typography } from "@mui/material";
import { SportsBasketball as BasketballIcon } from "@mui/icons-material";
import { SCHEDULE_COLORS as COLORS } from "./constants";

const ScheduleEmptyState = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 4, md: 6 },
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      textAlign: "center",
    }}
  >
    <BasketballIcon sx={{ fontSize: 58, color: COLORS.muted, mb: 1.5 }} />
    <Typography sx={{ color: COLORS.text, fontWeight: 850, fontSize: 18 }}>
      No matches found
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.75 }}>
      Adjust the filters to see more assignments.
    </Typography>
  </Paper>
);

export default ScheduleEmptyState;
