import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box } from "@mui/material";
import { LoadingSpinner, PageHeader } from "../../components/ui";
import {
  DelegateStatsGrid,
  RefereeAvailabilityCard,
  UpcomingMatchesCard,
} from "../../components/delegate/dashboard";
import { useDelegateDashboard } from "../../hooks";
import { delegatePanelColors as COLORS } from "../../theme/theme";

const DEFAULT_DASHBOARD = {
  summary: {
    pendingDelegations: 0,
    upcomingMatchesCount: 0,
    activeReferees: 0,
    confirmedDelegations: 0,
  },
  upcomingMatches: [],
  availability: [],
};

const DashboardPage = () => {
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    error,
  } = useDelegateDashboard();

  const dashboard = useMemo(() => {
    const data = dashboardData?.data || {};

    return {
      ...DEFAULT_DASHBOARD,
      ...data,
      summary: {
        ...DEFAULT_DASHBOARD.summary,
        ...(data.summary || {}),
      },
      upcomingMatches: Array.isArray(data.upcomingMatches)
        ? data.upcomingMatches
        : [],
      availability: Array.isArray(data.availability) ? data.availability : [],
    };
  }, [dashboardData?.data]);

  const handleOpenMatch = (match) => {
    navigate(`/delegate/delegation/${match.id}`);
  };

  if (isLoading && !dashboardData) {
    return <LoadingSpinner fullPage />;
  }

  if (error && !dashboardData) {
    return (
      <Box sx={{ width: "100%" }}>
        <Alert severity='error'>
          Failed to load dashboard data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", color: COLORS.text }}>
      <Box sx={{ maxWidth: 1800, mx: "auto", containerType: "inline-size" }}>
        <PageHeader title='Dashboard' subtitle='Delegation overview' />

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            Failed to refresh dashboard data: {error.message}
          </Alert>
        )}

        <DelegateStatsGrid
          summary={dashboard.summary}
          loading={isLoading || (isFetching && !dashboardData)}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 3,
            alignItems: "start",
            "@container (min-width: 900px)": {
              gridTemplateColumns: "minmax(0, 2fr) minmax(360px, 420px)",
            },
          }}
        >
          <UpcomingMatchesCard
            matches={dashboard.upcomingMatches}
            loading={isLoading}
            onViewAll={() => navigate("/delegate/matches")}
            onOpenMatch={handleOpenMatch}
          />

          <RefereeAvailabilityCard
            availability={dashboard.availability}
            loading={isLoading}
            onViewAll={() => navigate("/delegate/referees")}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
