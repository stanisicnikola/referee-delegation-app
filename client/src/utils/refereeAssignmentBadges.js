const FALLBACK_BG = "rgba(255, 255, 255, 0.1)";
const FALLBACK_COLOR = "#9ca3af";

const titleize = (value, fallback) => {
  if (!value) return fallback;

  return String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

const ROLE_BADGES = {
  first_referee: {
    label: "1st Referee",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.18)",
  },
  second_referee: {
    label: "2nd Referee",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.16)",
  },
  third_referee: {
    label: "3rd Referee",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.14)",
  },
  head: {
    label: "Head Referee",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.18)",
  },
  main: {
    label: "Main Referee",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.18)",
  },
  lead_referee: {
    label: "Lead Referee",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.18)",
  },
  assistant: {
    label: "Assistant",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.16)",
  },
  second: {
    label: "2nd Referee",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.16)",
  },
  third: {
    label: "3rd Referee",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.14)",
  },
  fourth: {
    label: "4th Official",
    color: "#f472b6",
    bg: "rgba(244, 114, 182, 0.16)",
  },
};

const ASSIGNMENT_STATUS_BADGES = {
  pending: {
    label: "Pending",
    shortLabel: "Pending",
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.16)",
  },
  accepted: {
    label: "Accepted",
    shortLabel: "Accepted",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.16)",
  },
  declined: {
    label: "Declined",
    shortLabel: "Declined",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
  },
};

export const getRefereeRoleBadge = (role) =>
  ROLE_BADGES[role] || {
    label: titleize(role, "Referee"),
    color: FALLBACK_COLOR,
    bg: FALLBACK_BG,
  };

export const getRefereeAssignmentStatusBadge = (status) => ({
  key: status,
  ...(ASSIGNMENT_STATUS_BADGES[status] || {
    label: titleize(status, "Unknown"),
    shortLabel: titleize(status, "Unknown"),
    color: FALLBACK_COLOR,
    bg: FALLBACK_BG,
  }),
});

export const isAcceptedAssignmentStatus = (status) => status === "accepted";
