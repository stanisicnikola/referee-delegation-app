import { Button } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { delegatePanelColors as COLORS } from "../../../theme/theme";

const ACTION_CONFIG = {
  pending: {
    label: "Assign",
    color: COLORS.accent,
    bg: "rgba(249, 115, 22, 0.09)",
    hoverBg: "rgba(249, 115, 22, 0.16)",
  },
  partial: {
    label: "Resume",
    color: COLORS.accent,
    bg: "rgba(249, 115, 22, 0.09)",
    hoverBg: "rgba(249, 115, 22, 0.16)",
  },
  complete: {
    label: "Review",
    color: COLORS.cyan,
    bg: "rgba(34, 211, 238, 0.09)",
    hoverBg: "rgba(34, 211, 238, 0.16)",
  },
  confirmed: {
    label: "View",
    color: COLORS.green,
    bg: "rgba(34, 197, 94, 0.09)",
    hoverBg: "rgba(34, 197, 94, 0.14)",
  },
};

const DelegationActionButton = ({ status, onClick }) => {
  const style = ACTION_CONFIG[status] || {
    label: "Open",
    color: COLORS.mutedStrong,
    bg: "rgba(107, 114, 128, 0.09)",
    hoverBg: "rgba(107, 114, 128, 0.16)",
  };

  return (
    <Button
      size='small'
      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
      onClick={onClick}
      sx={{
        px: 1.75,
        py: 0.625,
        borderRadius: "8px",
        textTransform: "none",
        fontSize: 13,
        fontWeight: 700,
        color: style.color,
        bgcolor: style.bg,
        border: "1px solid",
        borderColor: `${style.color}33`,
        whiteSpace: "nowrap",
        "&:hover": { bgcolor: style.hoverBg },
      }}
    >
      {style.label}
    </Button>
  );
};

export default DelegationActionButton;
