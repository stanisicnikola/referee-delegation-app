import { getRefereeRoleBadge } from "../../../utils/refereeAssignmentBadges";

export const SLOT_DEFINITIONS = [
  {
    slot: "main",
    role: "first_referee",
    hint: "Leads game decisions and crew coordination",
    accent: "#f97316",
  },
  {
    slot: "second",
    role: "second_referee",
    hint: "Supports primary calls and transitions",
    accent: "#3b82f6",
  },
  {
    slot: "third",
    role: "third_referee",
    hint: "Covers opposite side and off-ball actions",
    accent: "#22c55e",
  },
];

export const SLOT_CONFIG = SLOT_DEFINITIONS.map((config) => {
  const roleBadge = getRefereeRoleBadge(config.role);

  return {
    ...config,
    label: roleBadge.delegationLabel,
    buttonLabel: roleBadge.shortLabel,
  };
});

export const EMPTY_ASSIGNMENTS = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.slot, null]),
);

export const EMPTY_ASSIGNMENT_META = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.slot, null]),
);

export const ROLE_TO_SLOT = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.role, config.slot]),
);

export const SLOT_TO_ROLE = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.slot, config.role]),
);

export const ACTIVE_ASSIGNMENT_STATUSES = ["pending", "accepted"];

export const isActiveAssignmentStatus = (status) =>
  ACTIVE_ASSIGNMENT_STATUSES.includes(status);

const DECLINE_REASON_LABELS = {
  schedule_conflict: "Schedule conflict",
  health: "Health issue",
  personal: "Personal reason",
  travel: "Travel distance",
  unavailable: "Unavailable",
  other: "Other",
};

export const getDeclineReasonLabel = (reason) =>
  DECLINE_REASON_LABELS[reason] || reason || "No reason provided";
