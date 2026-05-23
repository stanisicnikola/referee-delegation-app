import { refereePanelColors } from "../../../theme/theme";

export const PENDING_COLORS = refereePanelColors;

export const DECLINE_REASONS = [
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "health", label: "Health issue" },
  { value: "personal", label: "Personal reason" },
  { value: "travel", label: "Travel distance" },
  { value: "other", label: "Other" },
];
