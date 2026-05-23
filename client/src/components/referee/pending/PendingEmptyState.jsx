import { Box, Paper, Typography } from "@mui/material";
import { SportsBasketball as BasketballIcon } from "@mui/icons-material";
import { PENDING_COLORS as COLORS } from "./constants";

const PendingEmptyState = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 4, md: 6 },
      borderRadius: "18px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      textAlign: "center",
    }}
  >
    <BasketballIcon sx={{ fontSize: 58, color: COLORS.muted, mb: 1.5 }} />
    <Typography sx={{ color: COLORS.text, fontWeight: 850, fontSize: 18 }}>
      No pending delegations
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.75 }}>
      You&apos;re all caught up. New assignments will appear here.
    </Typography>
  </Paper>
);

export default PendingEmptyState;
