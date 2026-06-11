import { Box } from "@mui/material";
import {
  AccessTime as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Schedule as PartialIcon,
  Verified as CompleteIcon,
} from "@mui/icons-material";
import { delegatePanelColors as COLORS } from "../../theme/theme";

const STATUS_STYLES = {
  pending: {
    color: COLORS.warning,
    bg: "rgba(234, 179, 8, 0.1)",
    label: "Pending assignment",
    compactLabel: "Pending",
    icon: PendingIcon,
  },
  partial: {
    color: COLORS.accent,
    bg: "rgba(249, 115, 22, 0.1)",
    label: "Partially assigned",
    compactLabel: "Partial",
    icon: PartialIcon,
  },
  complete: {
    color: COLORS.cyan,
    bg: "rgba(34, 211, 238, 0.12)",
    label: "Assigned",
    compactLabel: "Assigned",
    icon: CompleteIcon,
  },
  confirmed: {
    color: COLORS.green,
    bg: "rgba(34, 197, 94, 0.1)",
    label: "Confirmed",
    compactLabel: "Confirmed",
    icon: ConfirmedIcon,
  },
};

const DelegationStatusBadge = ({ status, compact = false, sx = {} }) => {
  const style = STATUS_STYLES[status] || {
    color: COLORS.mutedStrong,
    bg: "rgba(107, 114, 128, 0.14)",
    label: status || "Unknown",
    compactLabel: status || "Unknown",
    icon: null,
  };
  const Icon = style.icon;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 0.5 : 0.75,
        maxWidth: "100%",
        fontSize: 12,
        fontWeight: compact ? 700 : 800,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.color}33`,
        px: compact ? 1.2 : 1.25,
        py: compact ? 0.5 : 0.625,
        borderRadius: "9999px",
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {Icon && <Icon sx={{ fontSize: compact ? 13 : 14, flexShrink: 0 }} />}
      <Box
        component='span'
        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {compact ? style.compactLabel : style.label}
      </Box>
    </Box>
  );
};

export default DelegationStatusBadge;
