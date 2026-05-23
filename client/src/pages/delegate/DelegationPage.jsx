import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  useMatch,
  useDelegateReferees,
  useAvailableRefereesForMatch,
  useUpdateMatchResult,
} from "../../hooks";
import { getRefereeRoleBadge } from "../../utils/refereeAssignmentBadges";

const SLOT_DEFINITIONS = [
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

const SLOT_CONFIG = SLOT_DEFINITIONS.map((config) => {
  const roleBadge = getRefereeRoleBadge(config.role);

  return {
    ...config,
    label: roleBadge.delegationLabel,
    buttonLabel: roleBadge.shortLabel,
  };
});

const EMPTY_ASSIGNMENTS = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.slot, null]),
);

const EMPTY_ASSIGNMENT_META = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.slot, null]),
);

const ROLE_TO_SLOT = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.role, config.slot]),
);

const SLOT_TO_ROLE = Object.fromEntries(
  SLOT_CONFIG.map((config) => [config.slot, config.role]),
);

const DECLINE_REASON_LABELS = {
  schedule_conflict: "Schedule conflict",
  health: "Health issue",
  personal: "Personal reason",
  travel: "Travel distance",
  other: "Other",
};

const getDeclineReasonLabel = (reason) =>
  DECLINE_REASON_LABELS[reason] || reason || "No reason provided";

const DelegationPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [assignedReferees, setAssignedReferees] = useState(EMPTY_ASSIGNMENTS);
  const [assignmentMeta, setAssignmentMeta] = useState(EMPTY_ASSIGNMENT_META);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultForm, setResultForm] = useState({
    homeScore: "",
    awayScore: "",
    reportNotes: "",
  });

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
      if (assignment.status === "declined") return;

      const slot = ROLE_TO_SLOT[assignment.role];
      if (slot) {
        nextAssignments[slot] = assignment.referee || null;
        nextAssignmentMeta[slot] = assignment;
      }
    });

    setAssignedReferees(nextAssignments);
    setAssignmentMeta(nextAssignmentMeta);
  }, [match?.id, match?.refereeAssignments]);

  const assignedCount = Object.values(assignedReferees).filter(Boolean).length;
  const savedAssignmentsBySlot = useMemo(() => {
    const saved = { ...EMPTY_ASSIGNMENTS };
    if (!match?.refereeAssignments) return saved;

    match.refereeAssignments.forEach((assignment) => {
      if (assignment.status === "declined") return;

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
    ["scheduled", "postponed"].includes(match?.status) && hasMatchStartTimePassed
      ? "in_progress"
      : match?.status;
  const isMatchFinished = match?.status === "completed";
  const isMatchStarted = effectiveMatchStatus === "in_progress";
  const isMatchClosed = ["completed", "cancelled"].includes(match?.status);
  const isConfirmed = match?.delegationStatus === "confirmed";
  const savedAssignedCount =
    match?.refereeAssignments?.filter(
      (assignment) => assignment.status !== "declined",
    ).length || 0;
  const hasFullSavedCrew = savedAssignedCount >= 3;
  const isAssignmentLocked =
    isMatchStarted || isMatchClosed || isConfirmed || hasFullSavedCrew;

  const saveDisabledReason = (() => {
    if (isMatchFinished) return "This match is finished.";
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
        const fullName =
          `${referee.user?.firstName} ${referee.user?.lastName}`.toLowerCase();
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

  const handleOpenResultModal = () => {
    setResultForm({
      homeScore:
        match?.homeScore === null || match?.homeScore === undefined
          ? ""
          : String(match.homeScore),
      awayScore:
        match?.awayScore === null || match?.awayScore === undefined
          ? ""
          : String(match.awayScore),
      reportNotes: match?.reportNotes || "",
    });
    setResultModalOpen(true);
  };

  const handleCloseResultModal = () => {
    if (updateMatchResult.isPending) return;
    setResultModalOpen(false);
  };

  const handleCompleteMatch = async () => {
    const homeScore = Number(resultForm.homeScore);
    const awayScore = Number(resultForm.awayScore);
    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      return;
    }

    try {
      await updateMatchResult.mutateAsync({
        id: matchId,
        data: {
          homeScore,
          awayScore,
          reportNotes: resultForm.reportNotes.trim() || null,
        },
      });
      setResultModalOpen(false);
    } catch (error) {
      console.error("Error completing match:", error);
    }
  };

  const formatMatchDate = (dateString) => {
    if (!dateString) return { shortDay: "–", fullDate: "TBA", time: "–:–" };
    const date = new Date(dateString);
    return {
      shortDay: date
        .toLocaleDateString("en-GB", { weekday: "short" })
        .toUpperCase(),
      fullDate: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusChip = (delegationStatus) => {
    const map = {
      pending: {
        label: "Pending assignment",
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.12)",
      },
      partial: {
        label: "Partially assigned",
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.12)",
      },
      complete: {
        label: "Crew assigned",
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.14)",
      },
      confirmed: {
        label: "Confirmed",
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.12)",
      },
    };
    return (
      map[delegationStatus] || {
        label: "Unknown",
        color: "#9ca3af",
        bg: "rgba(107, 114, 128, 0.2)",
      }
    );
  };

  const getMatchStatusChip = (status) => {
    const map = {
      scheduled: {
        label: "Scheduled",
        color: "#9ca3af",
        bg: "rgba(107, 114, 128, 0.12)",
      },
      in_progress: {
        label: "In progress",
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.12)",
      },
      completed: {
        label: "Completed",
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.12)",
      },
      postponed: {
        label: "Postponed",
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.14)",
      },
      cancelled: {
        label: "Cancelled",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.12)",
      },
    };

    return (
      map[status] || {
        label: "Unknown",
        color: "#9ca3af",
        bg: "rgba(107, 114, 128, 0.12)",
      }
    );
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (matchLoading || refereesLoading) {
    return (
      <Box>
        <Box
          sx={{
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Skeleton
                variant='circular'
                width={40}
                height={40}
                sx={{ bgcolor: "#1e1e22", flexShrink: 0 }}
              />
              <Box>
                <Skeleton
                  variant='text'
                  width={180}
                  height={28}
                  sx={{ bgcolor: "#1e1e22" }}
                />
                <Skeleton
                  variant='text'
                  width={140}
                  height={20}
                  sx={{ bgcolor: "#1e1e22" }}
                />
              </Box>
            </Box>
            <Skeleton
              variant='rounded'
              width={160}
              height={42}
              sx={{ bgcolor: "#1e1e22", borderRadius: "12px" }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 3 }}>
          <Skeleton
            variant='rounded'
            height={156}
            sx={{ bgcolor: "#1a1a1d", borderRadius: "16px" }}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
              gap: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #242428" }}>
                <Skeleton
                  variant='text'
                  width={140}
                  height={28}
                  sx={{ bgcolor: "#1e1e22" }}
                />
                <Skeleton
                  variant='text'
                  width={220}
                  height={20}
                  sx={{ bgcolor: "#1e1e22" }}
                />
              </Box>
              <Box sx={{ p: 2.5, display: "grid", gap: 1.5 }}>
                {[0, 1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    variant='rounded'
                    height={72}
                    sx={{ bgcolor: "#1e1e22", borderRadius: "12px" }}
                  />
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid #242428" }}>
                <Skeleton
                  variant='rounded'
                  height={40}
                  sx={{ bgcolor: "#1e1e22", borderRadius: "10px" }}
                />
                <Skeleton
                  variant='text'
                  width={130}
                  height={18}
                  sx={{ bgcolor: "#1e1e22", mt: 1 }}
                />
              </Box>
              <Box sx={{ p: 1.5, display: "grid", gap: 1 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant='rounded'
                    height={60}
                    sx={{ bgcolor: "#1e1e22", borderRadius: "10px" }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!match) {
    return (
      <Box
        sx={{
          p: 0,
          pt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "16px",
            bgcolor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EventIcon sx={{ fontSize: 30, color: "#ef4444", opacity: 0.7 }} />
        </Box>
        <Typography sx={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>
          Match not found
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 14, maxWidth: 280 }}>
          This match doesn't exist or you don't have access to it.
        </Typography>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/delegate/matches")}
          sx={{
            mt: 1,
            color: "#f97316",
            bgcolor: "rgba(249,115,22,0.08)",
            borderRadius: "10px",
            textTransform: "none",
            px: 2.5,
            py: 1,
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(249,115,22,0.14)" },
          }}
        >
          Back to matches
        </Button>
      </Box>
    );
  }

  const dateInfo = formatMatchDate(match?.scheduledAt);
  const statusChip = getStatusChip(match?.delegationStatus);
  const matchStatusChip = getMatchStatusChip(effectiveMatchStatus);
  const canCompleteMatch =
    effectiveMatchStatus === "in_progress" && assignedCount > 0;
  const resultHomeScore = Number(resultForm.homeScore);
  const resultAwayScore = Number(resultForm.awayScore);
  const resultFormInvalid =
    resultForm.homeScore === "" ||
    resultForm.awayScore === "" ||
    !Number.isInteger(resultHomeScore) ||
    !Number.isInteger(resultAwayScore) ||
    resultHomeScore < 0 ||
    resultAwayScore < 0;

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
  const darkFieldSx = {
    "& .MuiInputLabel-root": { color: "#6b7280" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" },
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#f97316" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
    "& .MuiInputBase-inputMultiline": { color: "#fff", fontSize: "14px" },
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <Box
          sx={{
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.25, sm: 2 },
                minWidth: 0,
              }}
            >
              <IconButton
                onClick={() => navigate("/delegate/matches")}
                sx={{ color: "#9ca3af", "&:hover": { bgcolor: "#242428" } }}
              >
                <BackIcon />
              </IconButton>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "19px", sm: "22px" },
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  Referee Assignment
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {match?.homeTeam?.name || "TBA"} vs{" "}
                  {match?.awayTeam?.name || "TBA"}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "space-between", sm: "flex-end" },
              }}
            >
              {isMatchFinished ? (
                <Typography
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    px: 1.5,
                    py: 0.875,
                    borderRadius: "10px",
                    color: "#8dd9a8",
                    bgcolor: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.18)",
                    fontSize: "13px",
                    fontWeight: 700,
                    textAlign: { xs: "left", sm: "right" },
                  }}
                >
                  This match is finished.
                </Typography>
              ) : (
                <>
                  {/* Progress indicator */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 0.875,
                      borderRadius: "10px",
                      bgcolor:
                        assignedCount === 3
                          ? "rgba(34,197,94,0.09)"
                          : assignedCount > 0
                            ? "rgba(249,115,22,0.09)"
                            : "rgba(107,114,128,0.09)",
                      border: "1px solid",
                      borderColor:
                        assignedCount === 3
                          ? "rgba(34,197,94,0.25)"
                          : assignedCount > 0
                            ? "rgba(249,115,22,0.25)"
                            : "rgba(107,114,128,0.22)",
                      flex: { xs: "1 1 145px", sm: "0 0 auto" },
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {[0, 1, 2].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor:
                              i < assignedCount
                                ? assignedCount === 3
                                  ? "#22c55e"
                                  : "#f97316"
                                : "#3f3f46",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color:
                          assignedCount === 3
                            ? "#22c55e"
                            : assignedCount > 0
                              ? "#f97316"
                              : "#9ca3af",
                      }}
                    >
                      {assignedCount}/3 assigned
                    </Typography>
                  </Box>

                  {canCompleteMatch ? (
                    <Button
                      startIcon={
                        updateMatchResult.isPending ? (
                          <CircularProgress size={14} sx={{ color: "#fff" }} />
                        ) : (
                          <CheckIcon />
                        )
                      }
                      onClick={handleOpenResultModal}
                      disabled={updateMatchResult.isPending}
                      sx={{
                        flex: { xs: "1 1 180px", sm: "0 0 auto" },
                        px: 3,
                        py: 1.25,
                        borderRadius: "12px",
                        bgcolor: "#22c55e",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#16a34a" },
                        "&:disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
                      }}
                    >
                      Finish Match
                    </Button>
                  ) : (
                    <Button
                      startIcon={
                        delegateReferees.isPending ? (
                          <CircularProgress size={14} sx={{ color: "#fff" }} />
                        ) : (
                          <CheckIcon />
                        )
                      }
                      onClick={handleConfirmDelegation}
                      disabled={
                        Boolean(saveDisabledReason) ||
                        delegateReferees.isPending
                      }
                      sx={{
                        flex: { xs: "1 1 180px", sm: "0 0 auto" },
                        px: 3,
                        py: 1.25,
                        borderRadius: "12px",
                        bgcolor: "#f97316",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#ea580c" },
                        "&:disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
                      }}
                    >
                      {delegateReferees.isPending
                        ? "Saving..."
                        : "Save Assignment"}
                    </Button>
                  )}
                </>
              )}
              {!isMatchFinished && !canCompleteMatch && saveDisabledReason && (
                <Typography
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    color: "#6b7280",
                    fontSize: 12,
                    textAlign: { xs: "left", sm: "right" },
                  }}
                >
                  {saveDisabledReason}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 3 }}>
          {/* ── Match summary card ──────────────────────────────────────────── */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              p: { xs: 2, sm: 3 },
            }}
          >
            {/* Top row: badges + status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#f97316",
                    bgcolor: "rgba(249, 115, 22, 0.1)",
                    border: "1px solid rgba(249, 115, 22, 0.25)",
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "6px",
                    lineHeight: 1.6,
                  }}
                >
                  {match?.competition?.name || "League"}
                </Box>
                <Box
                  sx={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    bgcolor: "rgba(107, 114, 128, 0.1)",
                    border: "1px solid rgba(107, 114, 128, 0.2)",
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "6px",
                    lineHeight: 1.6,
                  }}
                >
                  Round {match?.round || "–"}
                </Box>
              </Box>

              {!isMatchFinished && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: statusChip.color,
                    bgcolor: statusChip.bg,
                    border: `1px solid ${statusChip.color}33`,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "9999px",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: statusChip.color,
                      ...(match?.delegationStatus === "pending" && {
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.4 },
                        },
                      }),
                    }}
                  />
                  {statusChip.label}
                </Box>
              )}
            </Box>

            {/* Teams vs block */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
                alignItems: "center",
                gap: { xs: 2.25, md: 2 },
                py: 1,
              }}
            >
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    justifyContent: "center",
                  }}
                >
                  <EventIcon sx={{ fontSize: 14, color: "#6b7280" }} />
                  <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
                    {dateInfo.shortDay}, {dateInfo.fullDate}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    justifyContent: "center",
                  }}
                >
                  <TimeIcon sx={{ fontSize: 14, color: "#f97316" }} />
                  <Typography
                    sx={{ color: "#f97316", fontSize: 17, fontWeight: 700 }}
                  >
                    {dateInfo.time}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: "9999px",
                    color: matchStatusChip.color,
                    bgcolor: matchStatusChip.bg,
                    border: `1px solid ${matchStatusChip.color}33`,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: matchStatusChip.color,
                    }}
                  />
                  {matchStatusChip.label}
                </Box>
              </Box>

              <TeamSummary
                team={match?.homeTeam}
                sideLabel='Home'
                color='#3b82f6'
                score={isMatchFinished ? match?.homeScore : undefined}
              />

              <Box
                sx={{
                  textAlign: "center",
                  px: { xs: 0, md: 2 },
                  py: { xs: 0, md: 0 },
                }}
              >
                <Typography
                  sx={{
                    color: "#2e2e33",
                    fontSize: { xs: 28, md: 30 },
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    lineHeight: 1,
                  }}
                >
                  VS
                </Typography>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 0.75,
                    justifyContent: "center",
                    mt: 1,
                  }}
                >
                  <EventIcon sx={{ fontSize: 14, color: "#6b7280" }} />
                  <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
                    {dateInfo.shortDay}, {dateInfo.fullDate}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 0.75,
                    justifyContent: "center",
                    mt: 0.5,
                  }}
                >
                  <TimeIcon sx={{ fontSize: 14, color: "#f97316" }} />
                  <Typography
                    sx={{ color: "#f97316", fontSize: 17, fontWeight: 700 }}
                  >
                    {dateInfo.time}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    alignItems: "center",
                    gap: 0.75,
                    mt: 1,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: "9999px",
                    color: matchStatusChip.color,
                    bgcolor: matchStatusChip.bg,
                    border: `1px solid ${matchStatusChip.color}33`,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: matchStatusChip.color,
                    }}
                  />
                  {matchStatusChip.label}
                </Box>
              </Box>

              <TeamSummary
                team={match?.awayTeam}
                sideLabel='Away'
                color='#ef4444'
                align='right'
                score={isMatchFinished ? match?.awayScore : undefined}
              />
            </Box>

            {/* Venue */}
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "1px solid #1e1e22",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LocationIcon sx={{ fontSize: 15, color: "#6b7280" }} />
              <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                {match?.venue?.name || "TBA"}
                {match?.venue?.city ? `, ${match.venue.city}` : ""}
              </Typography>
            </Box>
          </Box>

          {/* ── Crew + Candidates grid ──────────────────────────────────────── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Assigned Crew panel */}
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: "1px solid #242428",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <Box>
                  <Typography
                    sx={{ color: "#fff", fontSize: 18, fontWeight: 700 }}
                  >
                    Assigned Crew
                  </Typography>
                  <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.25 }}>
                    {assignedCount === 3
                      ? isConfirmed
                        ? "All referees confirmed this match."
                        : hasFullSavedCrew
                          ? "Full crew assigned — waiting for confirmations."
                          : "Full crew — ready to save."
                      : isMatchStarted
                        ? "Match started — assignment is locked."
                        : "Select referees from the right panel."}
                  </Typography>
                </Box>

                {/* Progress pills */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.75,
                    mt: 0.5,
                    flexShrink: 0,
                  }}
                >
                  {SLOT_CONFIG.map((cfg) => (
                    <Box
                      key={cfg.slot}
                      sx={{
                        width: 28,
                        height: 6,
                        borderRadius: "9999px",
                        bgcolor: assignedReferees[cfg.slot]
                          ? cfg.accent
                          : "#1e1e22",
                        border: `1px solid ${
                          assignedReferees[cfg.slot]
                            ? cfg.accent + "55"
                            : "#2e2e33"
                        }`,
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: "grid", gap: 1.5 }}>
                {SLOT_CONFIG.map((config) => (
                  <AssignmentSlot
                    key={config.slot}
                    config={config}
                    referee={assignedReferees[config.slot]}
                    assignment={assignmentMeta[config.slot]}
                    locked={isAssignmentLocked}
                    onRemove={() => handleRemove(config.slot)}
                  />
                ))}
              </Box>
            </Box>

            {/* Available Referees panel */}
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                overflow: "hidden",
                minHeight: 400,
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid #242428" }}>
                <TextField
                  placeholder='Search referees...'
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#1a1a1d",
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "#242428" },
                      "&:hover fieldset": { borderColor: "#3f3f46" },
                      "&.Mui-focused fieldset": { borderColor: "#f97316" },
                    },
                    "& .MuiInputBase-input": {
                      color: "#fff",
                      fontSize: "14px",
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1.25,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#6b7280",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                    }}
                  >
                    Available · {assignableWithoutSearch.length}
                    {declinedWithoutSearch.length > 0
                      ? ` · Declined ${declinedWithoutSearch.length}`
                      : ""}
                  </Typography>
                  {search.trim() !== "" && (
                    <Typography sx={{ color: "#4b5563", fontSize: 11 }}>
                      {availableReferees.length} result
                      {availableReferees.length !== 1 ? "s" : ""}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  maxHeight: 560,
                  overflowY: "auto",
                  display: "grid",
                  gap: 1,
                }}
              >
                {availableReferees.map((referee) => (
                  <CandidateRow
                    key={referee.id}
                    referee={referee}
                    assignedReferees={assignedReferees}
                    onAssign={handleAssign}
                    disabled={isAssignmentLocked}
                  />
                ))}

                {availableReferees.length === 0 && (
                  <Box
                    sx={{
                      py: 5,
                      px: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1.5,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "rgba(107,114,128,0.07)",
                        border: "1px solid rgba(107,114,128,0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 22, color: "#6b7280" }} />
                    </Box>
                    <Typography
                      sx={{ fontSize: 13, color: "#6b7280", maxWidth: 210 }}
                    >
                      {isAssignmentLocked
                        ? saveDisabledReason ||
                          "Assignments are locked for this match."
                        : emptyCandidatesMessage}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {isMatchFinished && (
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                p: { xs: 2, sm: 3 },
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                Match Report
              </Typography>
              <Box
                sx={{
                  mt: 1.5,
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: "12px",
                  bgcolor: "#0d0d0f",
                  border: "1px solid #1e1e22",
                  minHeight: 72,
                }}
              >
                <Typography
                  sx={{
                    color: match?.reportNotes ? "#d1d5db" : "#6b7280",
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {match?.reportNotes || "No report notes added."}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog
        open={resultModalOpen}
        onClose={handleCloseResultModal}
        fullWidth
        maxWidth='sm'
        PaperProps={{
          sx: {
            bgcolor: "#121214",
            color: "#fff",
            border: "1px solid #242428",
            borderRadius: "16px",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Complete Match
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: "8px !important" }}>
          <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>
            {match?.homeTeam?.name || "Home"} vs{" "}
            {match?.awayTeam?.name || "Away"}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <TextField
              label={match?.homeTeam?.name || "Home score"}
              type='number'
              value={resultForm.homeScore}
              onChange={(event) =>
                setResultForm((prev) => ({
                  ...prev,
                  homeScore: event.target.value,
                }))
              }
              inputProps={{ min: 0, step: 1 }}
              sx={darkFieldSx}
            />
            <TextField
              label={match?.awayTeam?.name || "Away score"}
              type='number'
              value={resultForm.awayScore}
              onChange={(event) =>
                setResultForm((prev) => ({
                  ...prev,
                  awayScore: event.target.value,
                }))
              }
              inputProps={{ min: 0, step: 1 }}
              sx={darkFieldSx}
            />
          </Box>

          <TextField
            label='Match report'
            value={resultForm.reportNotes}
            onChange={(event) =>
              setResultForm((prev) => ({
                ...prev,
                reportNotes: event.target.value,
              }))
            }
            multiline
            minRows={4}
            placeholder='Add match notes, incidents, or administrative remarks...'
            sx={darkFieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={handleCloseResultModal}
            disabled={updateMatchResult.isPending}
            sx={{
              color: "#9ca3af",
              textTransform: "none",
              borderRadius: "10px",
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteMatch}
            disabled={resultFormInvalid || updateMatchResult.isPending}
            startIcon={
              updateMatchResult.isPending ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <CheckIcon />
              )
            }
            sx={{
              bgcolor: "#22c55e",
              color: "#fff",
              textTransform: "none",
              borderRadius: "10px",
              px: 2.5,
              fontWeight: 700,
              "&:hover": { bgcolor: "#16a34a" },
              "&:disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
            }}
          >
            Complete Match
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TeamSummary = ({ team, sideLabel, color, align = "left", score }) => {
  const initials =
    team?.shortName || team?.name?.substring(0, 3).toUpperCase() || "TBA";
  const isRight = align === "right";
  const hasScore = score !== null && score !== undefined;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: hasScore ? "52px minmax(0, 1fr) 58px" : "52px minmax(0, 1fr)",
          md: hasScore
            ? isRight
              ? "58px minmax(0, 1fr) 52px"
              : "52px minmax(0, 1fr) 58px"
            : "52px minmax(0, 1fr)",
        },
        alignItems: "center",
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          gridColumn: { xs: 1, md: isRight ? 3 : 1 },
          gridRow: 1,
          width: 52,
          height: 52,
          borderRadius: "14px",
          bgcolor: `${color}14`,
          border: `1px solid ${color}30`,
          color: color,
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {initials}
      </Box>
      <Box
        sx={{
          textAlign: { xs: "left", md: isRight ? "right" : "left" },
          minWidth: 0,
          gridColumn: { xs: 2, md: 2 },
          gridRow: 1,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {team?.name || "TBA"}
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.25 }}>
          {sideLabel}
        </Typography>
      </Box>
      {hasScore && (
        <Box
          sx={{
            gridColumn: { xs: 3, md: isRight ? 1 : 3 },
            gridRow: 1,
            width: 54,
            height: 54,
            borderRadius: "10px",
            bgcolor: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.22)",
            color: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1,
            flexShrink: 0,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          {score}
        </Box>
      )}
    </Box>
  );
};

const AssignmentSlot = ({ config, referee, assignment, locked, onRemove }) => {
  const response = assignment?.status;
  const isAccepted = response === "accepted";
  const isPending = response === "pending";
  const canRemove = referee && !locked && !isAccepted;

  if (!referee) {
    return (
      <Box
        sx={{
          borderRadius: "12px",
          p: 2,
          bgcolor: "#0d0d0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          border: "1px solid #1a1a1d",
          borderLeft: `3px solid ${config.accent}33`,
        }}
      >
        <Box>
          <Typography sx={{ color: "#6b7280", fontSize: 14, fontWeight: 600 }}>
            {config.label}
          </Typography>
          <Typography sx={{ color: "#3f3f46", fontSize: 12, mt: 0.25 }}>
            {config.hint}
          </Typography>
        </Box>
        <Box
          sx={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#3f3f46",
            border: "1px dashed #2a2a2e",
            px: 1.25,
            py: 0.5,
            borderRadius: "6px",
            whiteSpace: "nowrap",
          }}
        >
          Unassigned
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: "12px",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        bgcolor: `${config.accent}0c`,
        border: `1px solid ${config.accent}28`,
        borderLeft: `3px solid ${config.accent}`,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            fontWeight: 700,
            fontSize: 14,
            bgcolor: `${config.accent}1e`,
            color: config.accent,
            border: `1px solid ${config.accent}44`,
          }}
        >
          {referee.user?.firstName?.[0]}
          {referee.user?.lastName?.[0]}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              {referee.user?.firstName} {referee.user?.lastName}
            </Typography>
            <Box
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: config.accent,
                bgcolor: `${config.accent}15`,
                border: `1px solid ${config.accent}30`,
                px: 1,
                py: "2px",
                borderRadius: "4px",
                lineHeight: 1.6,
              }}
            >
              {config.label}
            </Box>
            {response && (
              <Box
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isAccepted ? "#22c55e" : "#eab308",
                  bgcolor: isAccepted
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(234,179,8,0.12)",
                  border: "1px solid",
                  borderColor: isAccepted
                    ? "rgba(34,197,94,0.28)"
                    : "rgba(234,179,8,0.28)",
                  px: 1,
                  py: "2px",
                  borderRadius: "4px",
                  lineHeight: 1.6,
                }}
              >
                {isAccepted
                  ? "Accepted"
                  : isPending
                    ? "Waiting to accept"
                    : "Assigned"}
              </Box>
            )}
          </Box>
          <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.25 }}>
            Category {referee.licenseCategory || "N/A"} ·{" "}
            {referee.city || "N/A"}
          </Typography>
        </Box>
      </Box>

      {canRemove && (
        <IconButton
          onClick={onRemove}
          size='small'
          sx={{
            color: "#4b5563",
            flexShrink: 0,
            "&:hover": { bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444" },
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      )}
    </Box>
  );
};

const CandidateRow = ({ referee, assignedReferees, onAssign, disabled }) => {
  const declinedAssignment = referee.declinedAssignment;
  const hasDeclined = Boolean(declinedAssignment);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: hasDeclined ? "rgba(239,68,68,0.28)" : "#1e1e22",
        borderRadius: "10px",
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        transition: "all 0.15s ease",
        bgcolor: hasDeclined ? "rgba(239,68,68,0.05)" : "transparent",
        "&:hover": {
          borderColor: hasDeclined ? "rgba(239,68,68,0.4)" : "#2e2e33",
          bgcolor: hasDeclined
            ? "rgba(239,68,68,0.07)"
            : "rgba(255,255,255,0.02)",
        },
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {referee.user?.firstName?.[0]}
        {referee.user?.lastName?.[0]}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography
            sx={{
              color: "#e5e7eb",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {referee.user?.firstName} {referee.user?.lastName}
          </Typography>
          {hasDeclined && (
            <Box
              sx={{
                color: "#f87171",
                bgcolor: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "5px",
                px: 0.75,
                py: "1px",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Declined
            </Box>
          )}
        </Box>
        <Typography sx={{ color: "#6b7280", fontSize: 11 }}>
          Cat. {referee.licenseCategory || "–"} · {referee.city || "–"}
        </Typography>
        {hasDeclined && (
          <Typography sx={{ color: "#fca5a5", fontSize: 11, mt: 0.35 }}>
            {declinedAssignment.roleLabel} · {declinedAssignment.reasonLabel}
            {declinedAssignment.notes ? ` · ${declinedAssignment.notes}` : ""}
          </Typography>
        )}
      </Box>

      {/* Role assign buttons */}
      <Box
        sx={{
          display: { xs: "grid", sm: "flex" },
          gridTemplateColumns: { xs: "repeat(3, minmax(0, 1fr))" },
          gap: 0.5,
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {SLOT_CONFIG.map((slotCfg) => {
          const occupied = Boolean(assignedReferees[slotCfg.slot]);
          const isDisabled = disabled || occupied || hasDeclined;
          return (
            <Box
              key={slotCfg.slot}
              onClick={
                isDisabled ? undefined : () => onAssign(referee, slotCfg.slot)
              }
              title={
                hasDeclined
                  ? `Declined this match: ${declinedAssignment.reasonLabel}`
                  : disabled
                  ? "Assignments are locked for this match"
                  : occupied
                    ? `${slotCfg.label} slot is taken`
                    : `Assign as ${slotCfg.label}`
              }
              sx={{
                px: 1.25,
                py: "5px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 600,
                lineHeight: 1.4,
                cursor: isDisabled ? "not-allowed" : "pointer",
                border: "1px solid",
                borderColor: isDisabled ? "#1e1e22" : `${slotCfg.accent}44`,
                color: isDisabled ? "#2a2a2e" : slotCfg.accent,
                bgcolor: isDisabled ? "transparent" : `${slotCfg.accent}10`,
                userSelect: "none",
                transition: "all 0.15s",
                textAlign: "center",
                ...(!isDisabled && {
                  "&:hover": {
                    bgcolor: `${slotCfg.accent}22`,
                    borderColor: `${slotCfg.accent}77`,
                  },
                }),
              }}
            >
              {isDisabled ? "—" : slotCfg.buttonLabel}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default DelegationPage;
