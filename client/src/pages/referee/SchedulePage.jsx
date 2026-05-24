import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  SportsBasketball as BasketballIcon,
} from "@mui/icons-material";
import {
  useCompetitions,
  useAcceptAssignment,
  useMyAssignments,
  useRejectAssignment,
} from "../../hooks";
import {
  FilterSelect,
  RefereeAssignmentStatusBadge,
  RefereeRoleBadge,
} from "../../components/ui";
import { DeclineAssignmentDialog } from "../../components/referee/pending";
import {
  isAcceptedAssignmentStatus,
  REFEREE_ROLE_OPTIONS,
} from "../../utils/refereeAssignmentBadges";

const COLORS = {
  bg: "#0a0a0b",
  card: "#121214",
  cardHover: "#17171a",
  panel: "#1a1a1d",
  border: "#242428",
  borderSoft: "rgba(255, 255, 255, 0.08)",
  text: "#f8fafc",
  muted: "#6b7280",
  mutedStrong: "#9ca3af",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#60a5fa",
  purple: "#c084fc",
};

const PERIOD_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const getMatch = (assignment) => assignment?.match || assignment?.Match || null;

const getAssignmentMatchId = (assignment) =>
  assignment?.matchId || assignment?.match_id || getMatch(assignment)?.id;

const getScheduledDate = (match) => {
  const value = match?.scheduledAt || match?.matchDate || match?.date;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTeamName = (match, side) => {
  const key = side === "home" ? "homeTeam" : "awayTeam";
  const fallbackKey = side === "home" ? "HomeTeam" : "AwayTeam";

  return (
    match?.[key]?.name ||
    match?.[fallbackKey]?.name ||
    (side === "home" ? "Home team" : "Away team")
  );
};

const getCompetition = (match) =>
  match?.competition || match?.Competition || null;

const getCompetitionName = (match) =>
  getCompetition(match)?.name || "Competition";

const getVenueText = (match) => {
  const venue = match?.venue || match?.Venue;
  if (!venue) return "Venue not set";

  return [venue.name, venue.city].filter(Boolean).join(", ");
};

const getRefereeAssignments = (match) =>
  match?.refereeAssignments ||
  match?.RefereeAssignments ||
  match?.matchReferees ||
  [];

const getRefereeName = (assignment) => {
  const user =
    assignment?.referee?.user ||
    assignment?.referee?.User ||
    assignment?.Referee?.user ||
    assignment?.Referee?.User;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || "Colleague";
};

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatDate = (match) => {
  const date = getScheduledDate(match);

  if (!date) {
    return {
      day: "--",
      month: "---",
      weekday: "---",
      time: "--:--",
      monthGroup: "Date not set",
      sortKey: "9999-99",
    };
  }

  const month = date.toLocaleDateString("en-US", { month: "short" });
  const monthGroup = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month,
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    monthGroup,
    sortKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`,
  };
};

const pluralizeMatches = (count) => `${count} match${count === 1 ? "" : "es"}`;

const toDeclineDialogAssignment = (assignment) => {
  const match = getMatch(assignment);
  const date = getScheduledDate(match);

  return {
    ...assignment,
    matchId: getAssignmentMatchId(assignment),
    matchLabel: `${getTeamName(match, "home")} vs ${getTeamName(match, "away")}`,
    dateInfo: {
      full: date
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Date not set",
    },
  };
};

const getAcceptedColleagues = (assignment) => {
  if (!isAcceptedAssignmentStatus(assignment.status)) return [];

  const currentRefereeId = assignment.refereeId || assignment.referee_id;
  const match = getMatch(assignment);

  return getRefereeAssignments(match)
    .filter((matchAssignment) => {
      const refereeId = matchAssignment.refereeId || matchAssignment.referee_id;

      return (
        refereeId &&
        refereeId !== currentRefereeId &&
        isAcceptedAssignmentStatus(matchAssignment.status)
      );
    })
    .map((matchAssignment, index) => ({
      id:
        matchAssignment.refereeId ||
        matchAssignment.referee_id ||
        matchAssignment.id ||
        index,
      name: getRefereeName(matchAssignment),
    }));
};

const SchedulePage = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedCompetition, setSelectedCompetition] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("upcoming");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    refetch,
  } = useMyAssignments({
    competitionId:
      selectedCompetition !== "all" ? selectedCompetition : undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
    period: selectedPeriod !== "all" ? selectedPeriod : undefined,
    limit: 1000,
  });
  const { data: competitionsData } = useCompetitions();
  const acceptAssignment = useAcceptAssignment();
  const rejectAssignment = useRejectAssignment();

  const assignments = useMemo(
    () => assignmentsData?.data || [],
    [assignmentsData?.data],
  );

  const competitions = useMemo(
    () => competitionsData?.data || [],
    [competitionsData?.data],
  );

  const sortedAssignments = useMemo(() => {
    return assignments
      .slice()
      .filter((assignment) => getMatch(assignment))
      .sort((a, b) => {
        const dateA = getScheduledDate(getMatch(a))?.getTime() || 0;
        const dateB = getScheduledDate(getMatch(b))?.getTime() || 0;

        return selectedPeriod === "past" ? dateB - dateA : dateA - dateB;
      });
  }, [assignments, selectedPeriod]);

  const groupedByMonth = useMemo(() => {
    const groups = new Map();

    sortedAssignments.forEach((assignment) => {
      const match = getMatch(assignment);
      const dateInfo = formatDate(match);

      if (!groups.has(dateInfo.sortKey)) {
        groups.set(dateInfo.sortKey, {
          name: dateInfo.monthGroup,
          matches: [],
        });
      }

      groups.get(dateInfo.sortKey).matches.push(assignment);
    });

    return [...groups.entries()].sort(([keyA], [keyB]) =>
      selectedPeriod === "past"
        ? keyB.localeCompare(keyA)
        : keyA.localeCompare(keyB),
    );
  }, [sortedAssignments, selectedPeriod]);

  const handleAccept = async (assignment) => {
    const matchId = getAssignmentMatchId(assignment);
    if (!matchId) return;

    try {
      await acceptAssignment.mutateAsync(matchId);
      await refetch();
    } catch {
      // Toast is handled by useAcceptAssignment.
    }
  };

  const handleDeclineClick = (event, assignment) => {
    event.currentTarget.blur();
    setSelectedAssignment(toDeclineDialogAssignment(assignment));
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
        data: {
          reason,
          notes,
        },
      });
      await refetch();
      handleDeclineClose();
    } catch {
      console.error("Failed to decline assignment");
    }
  };

  const isActionPending =
    acceptAssignment.isPending || rejectAssignment.isPending;

  if (assignmentsLoading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: COLORS.bg,
        }}
      >
        <CircularProgress sx={{ color: COLORS.green }} />
      </Box>
    );
  }

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
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", lg: "flex-start" },
            justifyContent: "space-between",
            gap: 2.5,
            mb: 3.5,
            flexDirection: { xs: "column", lg: "column" },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "34px", sm: "40px", md: "48px" },
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.05,
              }}
            >
              My Schedule
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Overview of all your matches
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: { sm: "wrap" },
              gap: 2,
              width: "100%",
            }}
          >
            <FilterSelect
              variant='referee'
              value={selectedCompetition}
              onChange={(event) => setSelectedCompetition(event.target.value)}
              placeholder='All Competitions'
              minWidth={260}
              options={competitions.map((competition) => ({
                value: competition.id,
                label: competition.name,
              }))}
            />
            <FilterSelect
              variant='referee'
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              placeholder='All Roles'
              minWidth={220}
              options={REFEREE_ROLE_OPTIONS}
            />
            <FilterSelect
              variant='referee'
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              placeholder='All Matches'
              minWidth={220}
              options={PERIOD_OPTIONS}
            />
          </Box>
        </Box>

        {sortedAssignments.length === 0 ? (
          <EmptyState />
        ) : (
          <Stack spacing={4.25}>
            {groupedByMonth.map(([monthKey, group]) => (
              <Box key={monthKey}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: COLORS.text,
                      fontSize: { xs: "1.08rem", md: "1.25rem" },
                      fontWeight: 800,
                    }}
                  >
                    {group.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: { xs: "0.86rem", md: "0.92rem" },
                      fontWeight: 700,
                    }}
                  >
                    ({pluralizeMatches(group.matches.length)})
                  </Typography>
                </Box>

                <Stack spacing={1.75}>
                  {group.matches.map((assignment) => (
                    <MatchCard
                      key={assignment.id || getAssignmentMatchId(assignment)}
                      assignment={assignment}
                      isActionPending={isActionPending}
                      onAccept={handleAccept}
                      onDecline={handleDeclineClick}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
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

const EmptyState = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 4, md: 6 },
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      textAlign: "center",
    }}
  >
    <BasketballIcon sx={{ fontSize: 58, color: COLORS.muted, mb: 1.5 }} />
    <Typography sx={{ color: COLORS.text, fontWeight: 800, fontSize: 18 }}>
      No matches found
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.75 }}>
      Adjust the filters to see more assignments.
    </Typography>
  </Paper>
);

const MatchCard = ({ assignment, isActionPending, onAccept, onDecline }) => {
  const match = getMatch(assignment);
  const dateInfo = formatDate(match);
  const isPending = assignment.status === "pending";
  const showColleagues = isAcceptedAssignmentStatus(assignment.status);
  const colleagues = getAcceptedColleagues(assignment);
  const roundLabel = match?.round ? `Round ${match.round}` : null;
  const matchNumberLabel = match?.matchNumber
    ? `Match ${match.matchNumber}`
    : null;
  const footerItems = [roundLabel, matchNumberLabel].filter(Boolean);

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: "18px",
        bgcolor: COLORS.card,
        border: isPending
          ? `1px solid rgba(234, 179, 8, 0.42)`
          : `1px solid ${COLORS.border}`,
        transition: "background-color 0.16s ease, border-color 0.16s ease",
        "&:hover": {
          bgcolor: COLORS.cardHover,
          borderColor: isPending
            ? "rgba(234, 179, 8, 0.56)"
            : "rgba(255, 255, 255, 0.16)",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "124px minmax(0, 1fr) auto",
          },
          gridTemplateAreas: {
            xs: `"date" "content" "actions"`,
            md: `"date content actions"`,
          },
          minHeight: { md: 148 },
        }}
      >
        <DateRail dateInfo={dateInfo} isPending={isPending} />

        <Box
          sx={{
            gridArea: "content",
            minWidth: 0,
            px: { xs: 2.25, md: 3 },
            py: { xs: 2.25, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mb: 1.35,
            }}
          >
            <TinyBadge label={getCompetitionName(match)} tone='competition' />
            <RefereeRoleBadge
              role={assignment.role}
              sx={{
                height: 25,
                fontWeight: 900,
                maxWidth: { xs: 180, md: 240 },
              }}
            />
          </Box>

          <Typography
            sx={{
              color: COLORS.text,
              fontWeight: 800,
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {getTeamName(match, "home")} vs {getTeamName(match, "away")}
          </Typography>

          <Box
            sx={{
              mt: 1.15,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: COLORS.mutedStrong,
              minWidth: 0,
            }}
          >
            <LocationIcon sx={{ color: COLORS.muted, fontSize: 19 }} />
            <Typography
              sx={{
                fontSize: { xs: 14, md: 15 },
                fontWeight: 650,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: { xs: "normal", sm: "nowrap" },
              }}
            >
              {getVenueText(match)}
            </Typography>
          </Box>

          {(showColleagues || footerItems.length > 0) && (
            <Box
              sx={{
                mt: 2.15,
                pt: 1.75,
                borderTop: `1px solid ${COLORS.borderSoft}`,
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                color: COLORS.mutedStrong,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {showColleagues && <ColleaguesInfo colleagues={colleagues} />}
              {showColleagues && footerItems.length > 0 && <FooterDot />}
              {footerItems.map((item, index) => (
                <Box
                  key={item}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  {index > 0 && <FooterDot />}
                  <span>{item}</span>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            gridArea: "actions",
            px: { xs: 2.25, md: 3 },
            pb: { xs: 2.25, md: 0 },
            py: { md: 3 },
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: { xs: "flex-start", md: "flex-end" },
            minWidth: { md: isPending ? 218 : 154 },
          }}
        >
          {isPending ? (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant='contained'
                startIcon={<CloseIcon />}
                disabled={isActionPending}
                onClick={(event) => onDecline(event, assignment)}
                sx={declineButtonSx}
              >
                Decline
              </Button>
              <Button
                variant='contained'
                startIcon={<CheckIcon />}
                disabled={isActionPending}
                onClick={() => onAccept(assignment)}
                sx={acceptButtonSx}
              >
                Accept
              </Button>
            </Box>
          ) : (
            <RefereeAssignmentStatusBadge
              status={assignment.status}
              showAcceptedIcon
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const DateRail = ({ dateInfo, isPending }) => (
  <Box
    sx={{
      gridArea: "date",
      minHeight: { xs: 86, md: "100%" },
      bgcolor: isPending ? "rgba(234, 179, 8, 0.06)" : COLORS.panel,
      borderRight: { xs: "none", md: `1px solid ${COLORS.border}` },
      borderBottom: { xs: `1px solid ${COLORS.border}`, md: "none" },
      display: "flex",
      flexDirection: { xs: "row", md: "column" },
      alignItems: "center",
      justifyContent: { xs: "space-between", md: "center" },
      gap: { xs: 1.5, md: 0.25 },
      px: { xs: 2.25, md: 1.5 },
      py: { xs: 1.5, md: 2.25 },
      textAlign: { xs: "left", md: "center" },
    }}
  >
    <Box>
      <Typography
        sx={{
          color: COLORS.mutedStrong,
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0,
        }}
      >
        {dateInfo.weekday}
      </Typography>
      <Typography
        sx={{
          color: COLORS.text,
          fontSize: { xs: 30, md: 34 },
          lineHeight: 1,
          fontWeight: 900,
          mt: 0.4,
        }}
      >
        {dateInfo.day}
      </Typography>
    </Box>

    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: { xs: 15, md: 16 },
        fontWeight: 800,
      }}
    >
      {dateInfo.time}
    </Typography>
  </Box>
);

const ColleaguesInfo = ({ colleagues }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography component='span' sx={{ fontSize: 13, fontWeight: 800 }}>
      Colleagues:
    </Typography>
    {colleagues.length > 0 ? (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {colleagues.map((colleague, index) => (
          <Box
            key={colleague.id}
            title={colleague.name}
            sx={{
              width: 30,
              height: 30,
              ml: index === 0 ? 0 : -0.65,
              borderRadius: "50%",
              border: `2px solid ${COLORS.card}`,
              bgcolor: index % 2 === 0 ? "#5578f2" : "#d946b9",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {getInitials(colleague.name)}
          </Box>
        ))}
      </Box>
    ) : (
      <Typography
        component='span'
        sx={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}
      >
        None
      </Typography>
    )}
  </Box>
);

const FooterDot = () => (
  <Box
    sx={{
      width: 4,
      height: 4,
      borderRadius: "50%",
      bgcolor: COLORS.muted,
      flexShrink: 0,
    }}
  />
);

const TinyBadge = ({ label, tone, color, bg }) => {
  const isCompetition = tone === "competition";

  return (
    <Chip
      size='small'
      label={label}
      sx={{
        height: 25,
        borderRadius: "7px",
        bgcolor: isCompetition ? "rgba(249, 115, 22, 0.16)" : bg,
        color: isCompetition ? COLORS.orange : color,
        fontSize: 12,
        fontWeight: 900,
        maxWidth: { xs: 180, md: 240 },
        "& .MuiChip-label": {
          px: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }}
    />
  );
};

const acceptButtonSx = {
  px: 1.85,
  py: 0.95,
  borderRadius: "10px",
  background: COLORS.border,
  color: COLORS.text,
  boxShadow: "none",
  fontSize: 13,
  fontWeight: 850,
  whiteSpace: "nowrap",
  "&:hover": {
    background: "rgba(48, 227, 66, 0.26)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    background: "rgba(255, 255, 255, 0.08)",
    color: COLORS.muted,
  },
  "& .MuiButton-startIcon": { color: COLORS.green },
};

const declineButtonSx = {
  px: 1.85,
  py: 0.95,
  borderRadius: "10px",
  background: "rgba(239, 68, 68, 0.16)",
  color: "#fca5a5",
  boxShadow: "none",
  fontSize: 13,
  fontWeight: 850,
  whiteSpace: "nowrap",
  "&:hover": {
    background: "rgba(239, 68, 68, 0.24)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    background: "rgba(255, 255, 255, 0.08)",
    color: COLORS.muted,
  },
  "& .MuiButton-startIcon": { color: COLORS.red },
};

export default SchedulePage;
