import { Chip } from "@mui/material";

const statusConfig = {
  // User status
  active: { label: "Active", color: "success" },
  inactive: { label: "Inactive", color: "default" },
  suspended: { label: "Suspended", color: "error" },

  // Match status
  scheduled: { label: "Scheduled", color: "info" },
  in_progress: { label: "In Progress", color: "warning" },
  completed: { label: "Completed", color: "success" },
  postponed: { label: "Postponed", color: "default" },
  cancelled: { label: "Cancelled", color: "error" },

  // Delegation status
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "success" },
  rejected: { label: "Rejected", color: "error" },
  delegated: { label: "Delegated", color: "info" },
  not_delegated: { label: "Not Delegated", color: "default" },

  // Competition status
  upcoming: { label: "Upcoming", color: "info" },
  ongoing: { label: "Ongoing", color: "success" },
  finished: { label: "Finished", color: "default" },

  // Roles
  admin: { label: "Admin", color: "error" },
  delegate: { label: "Delegate", color: "info" },
  referee: { label: "Referee", color: "success" },

  // License categories
  A: { label: "Category A", color: "success" },
  B: { label: "Category B", color: "info" },
  C: { label: "Category C", color: "warning" },

  // Default
  default: { label: "Unknown", color: "default" },
};

const StatusBadge = ({ status, customLabel, size = "small", ...props }) => {
  const config = statusConfig[status] || statusConfig.default;
  const label = customLabel || config.label;

  return (
    <Chip
      label={label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: "0.75rem",
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StatusBadge;
