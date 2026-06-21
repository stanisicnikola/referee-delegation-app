import { Box, Button, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { delegatePanelColors as COLORS } from "../../../theme/theme";

const DashboardSectionHeader = ({ title, subtitle, actionLabel, onAction }) => (
  <Box
    sx={{
      px: { xs: 2.25, md: 3 },
      py: 2.25,
      borderBottom: `1px solid ${COLORS.border}`,
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      gap: 2,
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 13, color: COLORS.muted, mt: 0.35 }}>
          {subtitle}
        </Typography>
      )}
    </Box>

    {onAction && (
      <Button
        onClick={onAction}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 17 }} />}
        sx={{
          color: COLORS.accent,
          textTransform: "none",
          fontWeight: 800,
          whiteSpace: "nowrap",
          px: 1.5,
          py: 0.75,
          borderRadius: "8px",
          "&:hover": {
            color: COLORS.accentLight,
            bgcolor: "rgba(249, 115, 22, 0.08)",
          },
        }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default DashboardSectionHeader;
