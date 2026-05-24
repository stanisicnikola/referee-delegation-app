const titleize = (value, fallback) => {
  if (!value) return fallback;

  return String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

export const REFEREE_ASSIGNMENT_ROLES = {
  first_referee: {
    label: "1st Referee",
    delegationLabel: "Main Referee",
    shortLabel: "Main",
    number: "1",
    tone: "first",
  },
  second_referee: {
    label: "2nd Referee",
    delegationLabel: "Second Referee",
    shortLabel: "Second",
    number: "2",
    tone: "second",
  },
  third_referee: {
    label: "3rd Referee",
    delegationLabel: "Third Referee",
    shortLabel: "Third",
    number: "3",
    tone: "third",
  },
};

export const REFEREE_ROLE_OPTIONS = Object.entries(
  REFEREE_ASSIGNMENT_ROLES,
).map(([value, config]) => ({
  value,
  label: config.label,
}));

const ASSIGNMENT_STATUS_BADGES = {
  pending: {
    label: "Pending",
    shortLabel: "Pending",
    tone: "pending",
  },
  accepted: {
    label: "Accepted",
    shortLabel: "Accepted",
    tone: "accepted",
  },
  declined: {
    label: "Declined",
    shortLabel: "Declined",
    tone: "declined",
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    tone: "cancelled",
  },
};

export const getRefereeRoleBadge = (role) => {
  const roleConfig = REFEREE_ASSIGNMENT_ROLES[role];

  if (!roleConfig) {
    const label = titleize(role, "Referee");
    return {
      key: role,
      label,
      delegationLabel: label,
      shortLabel: label,
      number: "R",
      tone: "default",
    };
  }

  return {
    key: role,
    ...roleConfig,
  };
};

export const getRefereeRoleNumber = (role) =>
  getRefereeRoleBadge(role).number;

export const getRefereeAssignmentStatusBadge = (status) => ({
  key: status,
  ...(ASSIGNMENT_STATUS_BADGES[status] || {
    label: titleize(status, "Unknown"),
    shortLabel: titleize(status, "Unknown"),
    tone: "default",
  }),
});

export const isAcceptedAssignmentStatus = (status) => status === "accepted";
