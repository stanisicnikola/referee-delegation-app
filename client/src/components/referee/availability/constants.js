import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { refereePanelColors } from "../../../theme/theme";

export const AVAILABILITY_COLORS = refereePanelColors;

export const UNAVAILABILITY_REASONS = [
  "Annual leave",
  "Illness",
  "Injury",
  "Personal reasons",
  "Business commitments",
  "Other",
];

export const AVAILABILITY_STATUS_META = {
  approved: {
    label: "Approved",
    palette: "success",
    icon: CheckCircleIcon,
  },
  pending: {
    label: "Pending approval",
    palette: "warning",
    icon: AccessTimeIcon,
  },
  rejected: {
    label: "Rejected",
    palette: "error",
    icon: WarningAmberIcon,
  },
};
