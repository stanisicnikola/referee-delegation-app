import { useState } from "react";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import {
  useAcceptAssignment,
  useMyPendingAssignments,
  useRejectAssignment,
} from "../../hooks";
import { LoadingSpinner, PageHeader } from "../../components/ui";
import {
  DeclineAssignmentDialog,
  PendingAssignmentCard,
  PendingEmptyState,
  PENDING_COLORS as COLORS,
} from "../../components/referee/pending";

const PendingPage = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeAction, setActiveAction] = useState(null);

  const { data: pendingData, isLoading } = useMyPendingAssignments();
  const acceptAssignment = useAcceptAssignment();
  const rejectAssignment = useRejectAssignment();
  const pendingDelegations = pendingData?.data || [];
  const isActionPending =
    acceptAssignment.isPending || rejectAssignment.isPending;

  const getAssignmentActionId = (assignment) =>
    assignment?.id || assignment?.matchId;

  const handleAccept = async (assignment) => {
    if (!assignment?.matchId) return;

    setActiveAction({
      id: getAssignmentActionId(assignment),
      type: "accept",
    });

    try {
      await acceptAssignment.mutateAsync(assignment.matchId);
    } catch {
      // Toast is handled by useAcceptAssignment.
    } finally {
      setActiveAction(null);
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
    if (!reason || !selectedAssignment?.matchId) return;

    setActiveAction({
      id: getAssignmentActionId(selectedAssignment),
      type: "decline",
    });

    try {
      await rejectAssignment.mutateAsync({
        matchId: selectedAssignment.matchId,
        data: {
          reason,
          notes,
        },
      });
      handleDeclineClose();
    } catch {
      // Toast is handled by useRejectAssignment.
    } finally {
      setActiveAction(null);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

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
          title='Pending Delegations'
          subtitle='Review and respond to your pending match assignments'
        />

        {pendingDelegations.length === 0 ? (
          <PendingEmptyState />
        ) : (
          <Stack spacing={3} sx={{ maxWidth: 980, mx: "auto" }}>
            {pendingDelegations.map((assignment) => {
              const actionId = getAssignmentActionId(assignment);

              return (
                <PendingAssignmentCard
                  key={actionId}
                  assignment={assignment}
                  isActionPending={isActionPending}
                  isAccepting={
                    activeAction?.id === actionId &&
                    activeAction?.type === "accept"
                  }
                  isDeclining={
                    activeAction?.id === actionId &&
                    activeAction?.type === "decline"
                  }
                  onAccept={handleAccept}
                  onDecline={handleDeclineClick}
                />
              );
            })}
          </Stack>
        )}
      </Box>

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

export default PendingPage;
