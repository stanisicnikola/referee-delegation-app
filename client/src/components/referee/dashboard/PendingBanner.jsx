import { Box, Button, Paper, Typography } from "@mui/material";
import { WarningAmber as WarningIcon } from "@mui/icons-material";
import { DASHBOARD_COLORS as COLORS } from "./constants";

const PendingBanner = ({ count, onView }) => (
  <Paper
    elevation={0}
    sx={{
      mb: 3,
      p: { xs: 2, md: 2.5 },
      borderRadius: "8px",
      bgcolor: "rgba(234, 179, 8, 0.09)",
      border: "1px solid rgba(234, 179, 8, 0.24)",
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      gap: 2,
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: "rgba(234, 179, 8, 0.16)",
          color: COLORS.warning,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WarningIcon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: COLORS.warning, fontWeight: 800 }}>
          You have {count} pending assignment{count === 1 ? "" : "s"}
        </Typography>
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.25 }}>
          Please accept or decline within 24 hours.
        </Typography>
      </Box>
    </Box>

    <Button
      onClick={onView}
      sx={{
        px: 2.5,
        py: 1,
        borderRadius: "8px",
        color: COLORS.warning,
        bgcolor: "rgba(234, 179, 8, 0.14)",
        textTransform: "none",
        fontWeight: 800,
        width: { xs: "100%", sm: "auto" },
        "&:hover": { bgcolor: "rgba(234, 179, 8, 0.22)" },
      }}
    >
      View
    </Button>
  </Paper>
);

export default PendingBanner;
