import { Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { getRefereeRoleBadge } from "../../utils/refereeAssignmentBadges";

const getRoleColor = (theme, tone) => {
  const roleColors = {
    first: theme.palette.refereeRoleColors?.first || theme.palette.primary.main,
    second:
      theme.palette.refereeRoleColors?.second || theme.palette.secondary.main,
    third: theme.palette.refereeRoleColors?.third || theme.palette.success.main,
  };

  return roleColors[tone] || theme.palette.text.secondary;
};

const RefereeRoleBadge = ({ role, label, size = "small", sx = {} }) => {
  const theme = useTheme();
  const roleBadge = getRefereeRoleBadge(role);
  const color = getRoleColor(theme, roleBadge.tone);

  return (
    <Chip
      label={label || roleBadge.label}
      size={size}
      sx={{
        height: 26,
        borderRadius: "7px",
        bgcolor: alpha(color, 0.16),
        color,
        fontWeight: 800,
        fontSize: "12px",
        ...sx,
      }}
    />
  );
};

export default RefereeRoleBadge;
