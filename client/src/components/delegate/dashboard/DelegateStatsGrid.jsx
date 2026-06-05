import {
  AccessTime as PendingIcon,
  CalendarMonth as MatchesIcon,
  CheckCircle as ConfirmedIcon,
  Groups as RefereesIcon,
} from "@mui/icons-material";
import { StatsGrid } from "../../ui";
import { delegatePanelColors as COLORS } from "../../../theme/theme";

const DelegateStatsGrid = ({ summary, loading }) => {
  const stats = [
    {
      label: "Pending assignment",
      value: summary.pendingDelegations,
      icon: PendingIcon,
      color: COLORS.accent,
    },
    {
      label: "Upcoming matches",
      value: summary.upcomingMatchesCount,
      icon: MatchesIcon,
      color: COLORS.blue,
    },
    {
      label: "Active referees",
      value: summary.activeReferees,
      icon: RefereesIcon,
      color: COLORS.green,
    },
    {
      label: "Confirmed delegations",
      value: summary.confirmedDelegations,
      icon: ConfirmedIcon,
      color: COLORS.purple,
    },
  ];

  return (
    <StatsGrid
      stats={stats}
      loading={loading}
      columns={4}
      cardSx={{ minHeight: 132 }}
      valueSx={{ fontSize: { xs: 28, sm: 32 }, fontWeight: 800 }}
      labelSx={{ fontSize: 14, fontWeight: 700 }}
    />
  );
};

export default DelegateStatsGrid;
