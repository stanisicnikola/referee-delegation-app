import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  EmojiEventsOutlined as TrophyIcon,
  StarBorder as StarIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context";
import { useMyDashboard } from "../../hooks";
import { LoadingSpinner, PageHeader, StatsGrid } from "../../components/ui";
import {
  AssignmentStatusCard,
  CalendarCard,
  DASHBOARD_COLORS as COLORS,
  PendingBanner,
  UpcomingMatchesCard,
} from "../../components/referee/dashboard";

const DEFAULT_DASHBOARD = {
  summary: {
    thisMonth: 0,
    upcoming: 0,
    firstRefereeCount: 0,
    seasonTotal: 0,
  },
  assignmentStatus: {
    total: 0,
    accepted: 0,
    pending: 0,
    declined: 0,
  },
  pendingCount: 0,
  upcomingMatches: [],
  calendar: {
    monthLabel: "",
    days: [],
  },
};

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const dashboardQuery = useMemo(
    () => ({ month: getMonthKey(calendarMonth) }),
    [calendarMonth],
  );

  const {
    data: dashboardData,
    isLoading,
    isFetching,
  } = useMyDashboard(dashboardQuery);
  const dashboard = dashboardData?.data || DEFAULT_DASHBOARD;
  const summary = dashboard.summary || DEFAULT_DASHBOARD.summary;
  const assignmentStatus =
    dashboard.assignmentStatus || DEFAULT_DASHBOARD.assignmentStatus;

  const stats = [
    {
      label: "Matches this month",
      value: summary.thisMonth,
      icon: CalendarIcon,
      color: COLORS.orange,
    },
    {
      label: "Upcoming matches",
      value: summary.upcoming,
      icon: TrendingIcon,
      color: COLORS.blue,
    },
    {
      label: "As lead referee",
      value: summary.firstRefereeCount,
      icon: StarIcon,
      color: COLORS.purple,
    },
    {
      label: "Season total",
      value: summary.seasonTotal,
      icon: TrophyIcon,
      color: COLORS.green,
    },
  ];

  const handlePrevMonth = () => {
    setCalendarMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCalendarMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  if (isLoading && !dashboardData) return <LoadingSpinner fullPage />;

  return (
    <Box sx={{ minHeight: "100%", bgcolor: COLORS.bg, color: COLORS.text }}>
      <Box
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2.5, md: 3 },
          maxWidth: 1800,
          mx: "auto",
        }}
      >
        <PageHeader
          title={`Welcome, ${user?.firstName || "Referee"}!`}
          subtitle='Review your schedule and assignments'
        />

        {dashboard.pendingCount > 0 && (
          <PendingBanner
            count={dashboard.pendingCount}
            onView={() => navigate("/referee/pending")}
          />
        )}

        <StatsGrid
          stats={stats}
          columns={4}
          cardSx={{ minHeight: 142 }}
          valueSx={{ fontSize: { xs: "30px", sm: "34px" }, fontWeight: 800 }}
          labelSx={{ fontSize: "15px", fontWeight: 600 }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 2fr) 520px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <UpcomingMatchesCard
            assignments={dashboard.upcomingMatches || []}
            onViewAll={() => navigate("/referee/schedule")}
            onPending={() => navigate("/referee/pending")}
          />

          <Stack spacing={3}>
            <CalendarCard
              calendar={dashboard.calendar || DEFAULT_DASHBOARD.calendar}
              isSmall={isSmall}
              isUpdating={isFetching && !isLoading}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
            <AssignmentStatusCard statistics={assignmentStatus} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
