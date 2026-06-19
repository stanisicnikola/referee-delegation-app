import { useMemo, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import {
  useAcceptAssignment,
  useCompetitions,
  useMyAssignments,
  useRejectAssignment,
} from "../../hooks";
import { LoadingSpinner, PageHeader } from "../../components/ui";
import { DeclineAssignmentDialog } from "../../components/referee/pending";
import {
  ScheduleAssignmentList,
  ScheduleEmptyState,
  ScheduleFilters,
} from "../../components/referee/schedule";

const SCHEDULE_QUERY_LIMIT = 1000;

const SchedulePage = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedCompetition, setSelectedCompetition] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("upcoming");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const scheduleQuery = useMemo(() => {
    const query = {
      view: "schedule",
      limit: SCHEDULE_QUERY_LIMIT,
    };

    if (selectedCompetition !== "all") {
      query.competitionId = selectedCompetition;
    }
    if (selectedRole !== "all") {
      query.role = selectedRole;
    }
    if (selectedPeriod !== "all") {
      query.period = selectedPeriod;
    }

    return query;
  }, [selectedCompetition, selectedPeriod, selectedRole]);

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    refetch,
  } = useMyAssignments(scheduleQuery);
  const { data: competitionsData } = useCompetitions({ limit: 1000 });
  const acceptAssignment = useAcceptAssignment();
  const rejectAssignment = useRejectAssignment();

  const competitions = useMemo(
    () => competitionsData?.data || [],
    [competitionsData?.data],
  );

  const scheduleGroups = assignmentsData?.groups || [];
  const hasAssignments = scheduleGroups.some(
    (group) => group.matches?.length > 0,
  );
  const isActionPending =
    acceptAssignment.isPending || rejectAssignment.isPending;

  const handleAccept = async (assignment) => {
    if (!assignment?.matchId) return;

    try {
      await acceptAssignment.mutateAsync(assignment.matchId);
      await refetch();
    } catch {
      // Toast is handled by useAcceptAssignment.
    }
  };

  const handleDeclineClick = (event, assignment) => {
    event.currentTarget.blur();
    setSelectedAssignment(assignment);
    setDeclineModalOpen(true);
  };

  const handleDeclineClose = () => {
    if (rejectAssignment.isPending) return;

    setDeclineModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleDeclineSubmit = async ({ reason, notes }) => {
    const matchId = selectedAssignment?.matchId;
    if (!reason || !matchId) return;

    try {
      await rejectAssignment.mutateAsync({
        matchId,
        data: { reason, notes },
      });
      await refetch();
      handleDeclineClose();
    } catch {
      // Toast is handled by useRejectAssignment.
    }
  };

  if (assignmentsLoading) return <LoadingSpinner fullPage />;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader title='My Schedule' subtitle='Overview of all your matches' />

      <ScheduleFilters
        competitions={competitions}
        selectedCompetition={selectedCompetition}
        selectedRole={selectedRole}
        selectedPeriod={selectedPeriod}
        onCompetitionChange={(event) =>
          setSelectedCompetition(event.target.value)
        }
        onRoleChange={(event) => setSelectedRole(event.target.value)}
        onPeriodChange={(event) => setSelectedPeriod(event.target.value)}
      />

      {hasAssignments ? (
        <ScheduleAssignmentList
          groups={scheduleGroups}
          isActionPending={isActionPending}
          onAccept={handleAccept}
          onDecline={handleDeclineClick}
        />
      ) : (
        <ScheduleEmptyState />
      )}

      <DeclineAssignmentDialog
        fullScreen={isSmall}
        open={declineModalOpen}
        assignment={selectedAssignment}
        isSubmitting={rejectAssignment.isPending}
        onClose={handleDeclineClose}
        onSubmit={handleDeclineSubmit}
      />
    </Box>
  );
};

export default SchedulePage;
