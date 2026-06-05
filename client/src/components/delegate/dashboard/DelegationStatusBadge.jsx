import { Box } from "@mui/material";
import {
  AccessTime as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Schedule as PartialIcon,
  Verified as CompleteIcon,
} from "@mui/icons-material";
import { delegatePanelColors as COLORS } from "../../../theme/theme";

const STATUS_STYLES = {
  pending: {
    color: COLORS.warning,
    bg: "rgba(234, 179, 8, 0.1)",
    label: "Pending assignment",
    icon: PendingIcon,
  },
  partial: {
    color: COLORS.accent,
    bg: "rgba(249, 115, 22, 0.1)",
    label: "Partially assigned",
    icon: PartialIcon,
  },
  complete: {
    color: COLORS.cyan,
    bg: "rgba(56, 189, 248, 0.12)",
    label: "Crew assigned",
    icon: CompleteIcon,
  },
  confirmed: {
    color: COLORS.green,
    bg: "rgba(34, 197, 94, 0.1)",
    label: "Confirmed",
    icon: ConfirmedIcon,
  },
};

const DelegationStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || {
    color: COLORS.mutedStrong,
    bg: "rgba(107, 114, 128, 0.14)",
    label: status || "Unknown",
    icon: null,
  };
  const Icon = style.icon;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        maxWidth: "100%",
        fontSize: 12,
        fontWeight: 800,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.color}33`,
        px: 1.25,
        py: 0.625,
        borderRadius: "9999px",
        whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon sx={{ fontSize: 14, flexShrink: 0 }} />}
      <Box
        component='span'
        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {style.label}
      </Box>
    </Box>
  );
};

export default DelegationStatusBadge;
