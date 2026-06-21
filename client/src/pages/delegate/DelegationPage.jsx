import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import {
  useAvailableRefereesForMatch,
  useDelegateReferees,
  useMatch,
  useUpdateMatchResult,
} from "../../hooks";
import {
  AssignedCrewPanel,
  AvailableRefereesPanel,
  DelegationLoadingSkeleton,
  DelegationPageHeader,
  EMPTY_ASSIGNMENT_META,
  EMPTY_ASSIGNMENTS,
  MatchNotFound,
  MatchReportCard,
  MatchResultDialog,
  MatchSummaryCard,
  ROLE_TO_SLOT,
  SLOT_CONFIG,
  SLOT_TO_ROLE,
  getDeclineReasonLabel,
  isActiveAssignmentStatus,
} from "../../components/delegate/delegation";
import { getRefereeRoleBadge } from "../../utils/refereeAssignmentBadges";

const DelegationPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [assignedReferees, setAssignedReferees] = useState(EMPTY_ASSIGNMENTS);
  const [assignmentMeta, setAssignmentMeta] = useState(EMPTY_ASSIGNMENT_META);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  const { data: matchData, isLoading: matchLoading } = useMatch(matchId);
  const { data: availableRefereesData, isLoading: refereesLoading } =
    useAvailableRefereesForMatch(matchId);
  const delegateReferees = useDelegateReferees();
  const updateMatchResult = useUpdateMatchResult();

  const match = matchData?.data || matchData;
  const allAvailableReferees = useMemo(
    () => availableRefereesData?.data || [],
    [availableRefereesData?.data],
  );

  useEffect(() => {
    if (!match?.refereeAssignments) return;

    const nextAssignments = { ...EMPTY_ASSIGNMENTS };
    const nextAssignmentMeta = { ...EMPTY_ASSIGNMENT_META };

    match.refereeAssignments.forEach((assignment) => {
      if (!isActiveAssignmentStatus(assignment.status)) return;

      const slot = ROLE_TO_SLOT[assignment.role];
      if (slot) {
        nextAssignments[slot] = assignment.referee || null;
        nextAssignmentMeta[slot] = assignment;
      }
    });

    setAssignedReferees(nextAssignments);
    setAssignmentMeta(nextAssignmentMeta);
  }, [match?.id, match?.refereeAssignments]);

  const assignedCount = useMemo(
    () => Object.values(assignedReferees).filter(Boolean).length,
    [assignedReferees],
  );

  const savedAssignmentsBySlot = useMemo(() => {
    const saved = { ...EMPTY_ASSIGNMENTS };
    if (!match?.refereeAssignments) return saved;

    match.refereeAssignments.forEach((assignment) => {
      if (!isActiveAssignmentStatus(assignment.status)) return;

      const slot = ROLE_TO_SLOT[assignment.role];
      if (slot) saved[slot] = assignment.refereeId;
    });

    return saved;
  }, [match?.refereeAssignments]);

  const hasAssignmentChanges = useMemo(() => {
    return SLOT_CONFIG.some((config) => {
      const currentRefereeId = assignedReferees[config.slot]?.id || null;
      return currentRefereeId !== (savedAssignmentsBySlot[config.slot] || null);
    });
  }, [assignedReferees, savedAssignmentsBySlot]);

  const hasMatchStartTimePassed = match?.scheduledAt
    ? new Date(match.scheduledAt) <= new Date()
    : false;
  const effectiveMatchStatus =
    ["scheduled", "postponed"].includes(match?.status) &&
    hasMatchStartTimePassed
      ? "in_progress"
      : match?.status;
  const isMatchFinished = match?.status === "completed";
  const isMatchStarted = effectiveMatchStatus === "in_progress";
  const isMatchClosed = ["completed", "cancelled"].includes(match?.status);
  const isConfirmed = match?.delegationStatus === "confirmed";
  const activeAssignments = useMemo(
    () =>
      (match?.refereeAssignments || []).filter((assignment) =>
        isActiveAssignmentStatus(assignment.status),
      ),
    [match?.refereeAssignments],
  );
  const savedAssignedCount = activeAssignments.length;
  const acceptedAssignedCount = activeAssignments.filter(
    (assignment) => assignment.status === "accepted",
  ).length;
  const hasFullSavedCrew = savedAssignedCount >= SLOT_CONFIG.length;
  const hasFullAcceptedCrew = acceptedAssignedCount >= SLOT_CONFIG.length;
  const isAssignmentLocked =
    isMatchStarted || isMatchClosed || isConfirmed || hasFullSavedCrew;

  const saveDisabledReason = (() => {
    if (isMatchFinished) return "This match is finished.";
    if (match?.status === "cancelled") return "This match is cancelled.";
    if (isMatchClosed) return "This match is closed.";
    if (isMatchStarted) return "This match has already started.";
    if (isConfirmed) return "All referees confirmed this match.";
    if (hasFullSavedCrew)
      return "Full crew assigned. Waiting for referee confirmations.";
    if (assignedCount === 0) return "Select at least one referee.";
    if (!hasAssignmentChanges) return "No assignment changes to save.";
    return "";
  })();

  const declinedReferees = useMemo(() => {
    return (match?.refereeAssignments || [])
      .filter((assignment) => assignment.status === "declined")
      .map((assignment) => {
        const roleBadge = getRefereeRoleBadge(assignment.role);

        return {
          ...assignment.referee,
          declinedAssignment: {
            role: assignment.role,
            roleLabel: roleBadge.delegationLabel,
            reason: assignment.declineReason,
            reasonLabel: getDeclineReasonLabel(assignment.declineReason),
            notes: assignment.notes,
            responseAt: assignment.responseAt,
          },
        };
      })
      .filter((referee) => referee?.id);
  }, [match?.refereeAssignments]);

  const candidateReferees = useMemo(() => {
    const byId = new Map();

    allAvailableReferees.forEach((referee) => {
      if (referee?.id) byId.set(referee.id, referee);
    });

    declinedReferees.forEach((referee) => {
      const current = byId.get(referee.id) || {};
      byId.set(referee.id, { ...current, ...referee });
    });

    return Array.from(byId.values());
  }, [allAvailableReferees, declinedReferees]);

  const availableReferees = useMemo(() => {
    return candidateReferees
      .filter((referee) => {
        const fullName = `${referee.user?.firstName || ""} ${
          referee.user?.lastName || ""
        }`.toLowerCase();
        const matchesSearch =
          search.trim() === "" || fullName.includes(search.toLowerCase());
        const notAssigned = !Object.values(assignedReferees).some(
          (assigned) => assigned?.id === referee.id,
        );
        return matchesSearch && notAssigned;
      })
      .sort((a, b) => {
        if (a.declinedAssignment && !b.declinedAssignment) return 1;
        if (!a.declinedAssignment && b.declinedAssignment) return -1;

        const aName = `${a.user?.lastName || ""} ${a.user?.firstName || ""}`;
        const bName = `${b.user?.lastName || ""} ${b.user?.firstName || ""}`;
        return aName.localeCompare(bName);
      });
  }, [candidateReferees, assignedReferees, search]);

  const assignableWithoutSearch = useMemo(() => {
    return candidateReferees.filter(
      (referee) =>
        !referee.declinedAssignment &&
        !Object.values(assignedReferees).some(
          (assigned) => assigned?.id === referee.id,
        ),
    );
  }, [candidateReferees, assignedReferees]);

  const declinedWithoutSearch = useMemo(() => {
    return candidateReferees.filter(
      (referee) =>
        referee.declinedAssignment &&
        !Object.values(assignedReferees).some(
          (assigned) => assigned?.id === referee.id,
        ),
    );
  }, [candidateReferees, assignedReferees]);

  const handleAssign = (referee, slot) => {
    if (isAssignmentLocked || referee?.declinedAssignment) return;
    setAssignedReferees((prev) => ({ ...prev, [slot]: referee }));
    setAssignmentMeta((prev) => ({ ...prev, [slot]: null }));
  };

  const handleRemove = (slot) => {
    if (isAssignmentLocked || assignmentMeta[slot]?.status === "accepted") {
      return;
    }

    setAssignedReferees((prev) => ({ ...prev, [slot]: null }));
    setAssignmentMeta((prev) => ({ ...prev, [slot]: null }));
  };

  const handleConfirmDelegation = async () => {
    try {
      const refereeAssignments = Object.entries(assignedReferees)
        .filter(([, referee]) => !!referee?.id)
        .map(([slot, referee]) => ({
          refereeId: referee.id,
          role: SLOT_TO_ROLE[slot],
        }));

      await delegateReferees.mutateAsync({
        matchId,
        data: { refereeAssignments },
      });
      navigate("/delegate/matches");
    } catch (error) {
      console.error("Error confirming delegation:", error);
    }
  };

  const handleCloseResultModal = () => {
    if (updateMatchResult.isPending) return;
    setResultModalOpen(false);
  };

  const handleCompleteMatch = async (resultData) => {
    try {
      await updateMatchResult.mutateAsync({
        id: matchId,
        data: resultData,
      });
      setResultModalOpen(false);
    } catch (error) {
      console.error("Error completing match:", error);
    }
  };

  if (matchLoading || refereesLoading) {
    return <DelegationLoadingSkeleton />;
  }

  if (!match) {
    return <MatchNotFound onBack={() => navigate("/delegate/matches")} />;
  }

  const cancellationReason =
    match?.status === "cancelled" && match?.statusReason?.trim()
      ? match.statusReason.trim()
      : "";
  const showFinishMatchAction = isMatchStarted && !isMatchClosed;
  const canCompleteMatch = showFinishMatchAction && hasFullAcceptedCrew;
  const finishDisabledReason = (() => {
    if (!showFinishMatchAction || canCompleteMatch) return "";
    if (savedAssignedCount < SLOT_CONFIG.length) {
      return "Assign all three referees before finishing the match.";
    }
    return "All referees must accept before the match can be finished.";
  })();
  const onlyDeclinedCandidates =
    assignableWithoutSearch.length === 0 && declinedWithoutSearch.length > 0;
  const emptyCandidatesMessage =
    candidateReferees.length === 0
      ? "No eligible referees for this date. Everyone is unavailable or already assigned elsewhere."
      : onlyDeclinedCandidates
        ? "Only referees who declined this match are visible."
        : assignableWithoutSearch.length === 0
          ? "All eligible referees are already assigned to this match. Remove a slot to swap."
          : "No referees match your search.";

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <DelegationPageHeader
          match={match}
          assignedCount={assignedCount}
          isMatchFinished={isMatchFinished}
          showFinishMatchAction={showFinishMatchAction}
          canCompleteMatch={canCompleteMatch}
          finishDisabledReason={finishDisabledReason}
          saveDisabledReason={saveDisabledReason}
          isSavingAssignment={delegateReferees.isPending}
          isSavingResult={updateMatchResult.isPending}
          onBack={() => navigate("/delegate/matches")}
          onSaveAssignment={handleConfirmDelegation}
          onOpenResultModal={() => setResultModalOpen(true)}
        />

        <Box sx={{ display: "grid", gap: 3 }}>
          <MatchSummaryCard
            match={match}
            effectiveMatchStatus={effectiveMatchStatus}
            isMatchClosed={isMatchClosed}
            isMatchFinished={isMatchFinished}
            cancellationReason={cancellationReason}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <AssignedCrewPanel
              match={match}
              assignedCount={assignedCount}
              assignedReferees={assignedReferees}
              assignmentMeta={assignmentMeta}
              isAssignmentLocked={isAssignmentLocked}
              isConfirmed={isConfirmed}
              hasFullSavedCrew={hasFullSavedCrew}
              isMatchStarted={isMatchStarted}
              onRemove={handleRemove}
            />

            <AvailableRefereesPanel
              search={search}
              onSearchChange={setSearch}
              availableReferees={availableReferees}
              assignedReferees={assignedReferees}
              assignableCount={assignableWithoutSearch.length}
              declinedCount={declinedWithoutSearch.length}
              isAssignmentLocked={isAssignmentLocked}
              saveDisabledReason={saveDisabledReason}
              emptyCandidatesMessage={emptyCandidatesMessage}
              onAssign={handleAssign}
            />
          </Box>

          {isMatchFinished && (
            <MatchReportCard reportNotes={match.reportNotes} />
          )}
        </Box>
      </Box>

      <MatchResultDialog
        open={resultModalOpen}
        onClose={handleCloseResultModal}
        onSubmit={handleCompleteMatch}
        isLoading={updateMatchResult.isPending}
        match={match}
      />
    </>
  );
};

export default DelegationPage;
