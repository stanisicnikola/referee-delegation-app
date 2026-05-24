import { Box } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { getRefereeAssignmentStatusBadge } from "../../utils/refereeAssignmentBadges";

const getStatusColor = (theme, tone) => {
  const statusColors = {
    pending:
      theme.palette.refereeAssignmentStatusColors?.pending ||
      theme.palette.warning.main,
    accepted:
      theme.palette.refereeAssignmentStatusColors?.accepted ||
      theme.palette.success.main,
    declined:
      theme.palette.refereeAssignmentStatusColors?.declined ||
      theme.palette.error.main,
    cancelled:
      theme.palette.refereeAssignmentStatusColors?.cancelled ||
      theme.palette.error.main,
  };

  return statusColors[tone] || theme.palette.text.secondary;
};

const RefereeAssignmentStatusBadge = ({
  status,
  label,
  showAcceptedIcon = false,
  sx = {},
}) => {
  const theme = useTheme();
  const statusBadge = getRefereeAssignmentStatusBadge(status);
  const color = getStatusColor(theme, statusBadge.tone);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.85,
        px: 1.85,
        py: 0.75,
        borderRadius: "999px",
        bgcolor: alpha(color, 0.13),
        color,
        fontSize: 13,
        fontWeight: 900,
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {showAcceptedIcon && statusBadge.key === "accepted" ? (
        <CheckIcon sx={{ fontSize: 17 }} />
      ) : (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: color,
          }}
        />
      )}
      {label || statusBadge.label}
    </Box>
  );
};

export default RefereeAssignmentStatusBadge;
