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
} from "../../hooks";

const EMPTY_ASSIGNMENTS = {
  main: null,
  second: null,
  third: null,
};

const ROLE_TO_SLOT = {
  first_referee: "main",
  second_referee: "second",
  third_referee: "third",
};

const SLOT_TO_ROLE = {
  main: "first_referee",
  second: "second_referee",
  third: "third_referee",
};

const SLOT_CONFIG = [
  {
    slot: "main",
    role: "first_referee",
    label: "Main Referee",
    hint: "Leads game decisions and crew coordination",
    accent: "#f97316",
    buttonLabel: "Main",
  },
  {
    slot: "second",
    role: "second_referee",
    label: "Second Referee",
    hint: "Supports primary calls and transitions",
    accent: "#3b82f6",
    buttonLabel: "Second",
  },
  {
    slot: "third",
    role: "third_referee",
    label: "Third Referee",
    hint: "Covers opposite side and off-ball actions",
    accent: "#22c55e",
    buttonLabel: "Third",
  },
];

const DelegationPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [assignedReferees, setAssignedReferees] = useState(EMPTY_ASSIGNMENTS);

  const { data: matchData, isLoading: matchLoading } = useMatch(matchId);
  const { data: availableRefereesData, isLoading: refereesLoading } =
    useAvailableRefereesForMatch(matchId);
  const delegateReferees = useDelegateReferees();

  const match = matchData?.data || matchData;
  const allAvailableReferees = availableRefereesData?.data || [];

  useEffect(() => {
    if (!match?.refereeAssignments) return;

    const nextAssignments = { ...EMPTY_ASSIGNMENTS };
    match.refereeAssignments.forEach((assignment) => {
      const slot = ROLE_TO_SLOT[assignment.role];
      if (slot) {
        nextAssignments[slot] = assignment.referee || null;
      }
    });

    setAssignedReferees(nextAssignments);
  }, [match?.id, match?.refereeAssignments]);

  const assignedCount = Object.values(assignedReferees).filter(Boolean).length;

  const availableReferees = useMemo(() => {
    return allAvailableReferees
      .filter((referee) => {
        const fullName =
          `${referee.user?.firstName} ${referee.user?.lastName}`.toLowerCase();
        const matchesSearch =
          search.trim() === "" || fullName.includes(search.toLowerCase());
        const notAssigned = !Object.values(assignedReferees).some(
          (assigned) => assigned?.id === referee.id
        );
        return matchesSearch && notAssigned;
      })
      .sort((a, b) => {
        const aName = `${a.user?.lastName || ""} ${a.user?.firstName || ""}`;
        const bName = `${b.user?.lastName || ""} ${b.user?.firstName || ""}`;
        return aName.localeCompare(bName);
      });
  }, [allAvailableReferees, assignedReferees, search]);

  const availableWithoutSearch = useMemo(() => {
    return allAvailableReferees.filter(
      (referee) =>
        !Object.values(assignedReferees).some(
          (assigned) => assigned?.id === referee.id
        )
    );
  }, [allAvailableReferees, assignedReferees]);

  const handleAssign = (referee, slot) => {
    setAssignedReferees((prev) => ({ ...prev, [slot]: referee }));
  };

  const handleRemove = (slot) => {
    setAssignedReferees((prev) => ({ ...prev, [slot]: null }));
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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (matchLoading || refereesLoading) {
    return (
      <Box>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "rgba(10, 10, 11, 0.86)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #242428",
            zIndex: 40,
          }}
        >
          <Box
            sx={{
              px: 4,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ bgcolor: "#1e1e22", flexShrink: 0 }}
              />
              <Box>
                <Skeleton
                  variant="text"
                  width={180}
                  height={28}
                  sx={{ bgcolor: "#1e1e22" }}
                />
                <Skeleton
                  variant="text"
                  width={140}
                  height={20}
                  sx={{ bgcolor: "#1e1e22" }}
                />
              </Box>
            </Box>
            <Skeleton
              variant="rounded"
              width={160}
              height={42}
              sx={{ bgcolor: "#1e1e22", borderRadius: "12px" }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 4, display: "grid", gap: 3 }}>
          <Skeleton
            variant="rounded"
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
                  variant="text"
                  width={140}
                  height={28}
                  sx={{ bgcolor: "#1e1e22" }}
                />
                <Skeleton
                  variant="text"
                  width={220}
                  height={20}
                  sx={{ bgcolor: "#1e1e22" }}
                />
              </Box>
              <Box sx={{ p: 2.5, display: "grid", gap: 1.5 }}>
                {[0, 1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
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
                  variant="rounded"
                  height={40}
                  sx={{ bgcolor: "#1e1e22", borderRadius: "10px" }}
                />
                <Skeleton
                  variant="text"
                  width={130}
                  height={18}
                  sx={{ bgcolor: "#1e1e22", mt: 1 }}
                />
              </Box>
              <Box sx={{ p: 1.5, display: "grid", gap: 1 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
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
          p: 4,
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
        <Typography
          sx={{ color: "#6b7280", fontSize: 14, maxWidth: 280 }}
        >
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

  const emptyCandidatesMessage =
    allAvailableReferees.length === 0
      ? "No eligible referees for this date. Everyone is unavailable or already assigned elsewhere."
      : availableWithoutSearch.length === 0
      ? "All eligible referees are already assigned to this match. Remove a slot to swap."
      : "No referees match your search.";

  return (
    <Box>
      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "rgba(10, 10, 11, 0.86)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #242428",
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate("/delegate/matches")}
              sx={{ color: "#9ca3af", "&:hover": { bgcolor: "#242428" } }}
            >
              <BackIcon />
            </IconButton>

            <Box>
              <Typography
                sx={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}
              >
                Referee Assignment
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                {match?.homeTeam?.name || "TBA"} vs{" "}
                {match?.awayTeam?.name || "TBA"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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

            <Button
              startIcon={
                delegateReferees.isPending ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  <CheckIcon />
                )
              }
              onClick={handleConfirmDelegation}
              disabled={assignedCount === 0 || delegateReferees.isPending}
              sx={{
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
              {delegateReferees.isPending ? "Saving..." : "Save Assignment"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 4, display: "grid", gap: 3 }}>
        {/* ── Match summary card ──────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            p: 3,
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          </Box>

          {/* Teams vs block */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
              alignItems: "center",
              gap: 2,
              py: 1,
            }}
          >
            <TeamSummary
              team={match?.homeTeam}
              sideLabel="Home"
              color="#3b82f6"
            />

            <Box
              sx={{
                textAlign: "center",
                px: { xs: 0, md: 2 },
                py: { xs: 1, md: 0 },
              }}
            >
              <Typography
                sx={{
                  color: "#2e2e33",
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  lineHeight: 1,
                }}
              >
                VS
              </Typography>
              <Box
                sx={{
                  display: "flex",
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
                  display: "flex",
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
            </Box>

            <TeamSummary
              team={match?.awayTeam}
              sideLabel="Away"
              color="#ef4444"
              align="right"
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
              }}
            >
              <Box>
                <Typography
                  sx={{ color: "#fff", fontSize: 18, fontWeight: 700 }}
                >
                  Assigned Crew
                </Typography>
                <Typography
                  sx={{ color: "#6b7280", fontSize: 13, mt: 0.25 }}
                >
                  {assignedCount === 3
                    ? "Full crew — ready to save."
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

            <Box sx={{ p: 2.5, display: "grid", gap: 1.5 }}>
              {SLOT_CONFIG.map((config) => (
                <AssignmentSlot
                  key={config.slot}
                  config={config}
                  referee={assignedReferees[config.slot]}
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
                placeholder="Search referees..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
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
                  Available · {availableWithoutSearch.length}
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
                    {emptyCandidatesMessage}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TeamSummary = ({ team, sideLabel, color, align = "left" }) => {
  const initials =
    team?.shortName || team?.name?.substring(0, 3).toUpperCase() || "TBA";
  const isRight = align === "right";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexDirection: isRight ? "row-reverse" : "row",
      }}
    >
      <Box
        sx={{
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
      <Box sx={{ textAlign: isRight ? "right" : "left" }}>
        <Typography
          sx={{ color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}
        >
          {team?.name || "TBA"}
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.25 }}>
          {sideLabel}
        </Typography>
      </Box>
    </Box>
  );
};

const AssignmentSlot = ({ config, referee, onRemove }) => {
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
          border: "1px solid #1a1a1d",
          borderLeft: `3px solid ${config.accent}33`,
        }}
      >
        <Box>
          <Typography
            sx={{ color: "#6b7280", fontSize: 14, fontWeight: 600 }}
          >
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
          </Box>
          <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.25 }}>
            Category {referee.licenseCategory || "N/A"} ·{" "}
            {referee.city || "N/A"}
          </Typography>
        </Box>
      </Box>

      <IconButton
        onClick={onRemove}
        size="small"
        sx={{
          color: "#4b5563",
          flexShrink: 0,
          "&:hover": { bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444" },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

const CandidateRow = ({ referee, assignedReferees, onAssign }) => {
  return (
    <Box
      sx={{
        border: "1px solid #1e1e22",
        borderRadius: "10px",
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#2e2e33",
          bgcolor: "rgba(255,255,255,0.02)",
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
        <Typography sx={{ color: "#6b7280", fontSize: 11 }}>
          Cat. {referee.licenseCategory || "–"} · {referee.city || "–"}
        </Typography>
      </Box>

      {/* Role assign buttons */}
      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
        {SLOT_CONFIG.map((slotCfg) => {
          const occupied = Boolean(assignedReferees[slotCfg.slot]);
          return (
            <Box
              key={slotCfg.slot}
              onClick={occupied ? undefined : () => onAssign(referee, slotCfg.slot)}
              title={occupied ? `${slotCfg.label} slot is taken` : `Assign as ${slotCfg.label}`}
              sx={{
                px: 1.25,
                py: "5px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 600,
                lineHeight: 1.4,
                cursor: occupied ? "not-allowed" : "pointer",
                border: "1px solid",
                borderColor: occupied ? "#1e1e22" : `${slotCfg.accent}44`,
                color: occupied ? "#2a2a2e" : slotCfg.accent,
                bgcolor: occupied ? "transparent" : `${slotCfg.accent}10`,
                userSelect: "none",
                transition: "all 0.15s",
                ...(!occupied && {
                  "&:hover": {
                    bgcolor: `${slotCfg.accent}22`,
                    borderColor: `${slotCfg.accent}77`,
                  },
                }),
              }}
            >
              {occupied ? "—" : slotCfg.buttonLabel}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default DelegationPage;
