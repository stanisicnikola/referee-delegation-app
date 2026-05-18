import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingIcon,
  StarBorder as StarIcon,
  CheckCircleOutline as CheckIcon,
  WarningAmber as WarningIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  SportsBasketball as BasketballIcon,
  AccessTime as TimeIcon,
  EmojiEventsOutlined as TrophyIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context";
import { useMyAssignments, useMyStatistics } from "../../hooks";
import { matchesApi } from "../../api";
import {
  getRefereeAssignmentStatusBadge,
  getRefereeRoleBadge,
} from "../../utils/refereeAssignmentBadges";

const COLORS = {
  bg: "#0a0a0b",
  card: "#121214",
  cardHover: "#17171a",
  border: "#242428",
  borderSoft: "rgba(255, 255, 255, 0.08)",
  text: "#ffffff",
  muted: "#6b7280",
  mutedStrong: "#9ca3af",
  green: "#22c55e",
  orange: "#f97316",
  warning: "#eab308",
  blue: "#3b82f6",
  purple: "#a855f7",
  red: "#ef4444",
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMatch = (assignment) => assignment?.match || assignment?.Match || null;

const getAssignmentMatchId = (assignment) =>
  assignment?.matchId || assignment?.match_id || getMatch(assignment)?.id;

const hasMatchDetails = (match) =>
  Boolean(
    match &&
    (match.homeTeam || match.HomeTeam) &&
    (match.awayTeam || match.AwayTeam) &&
    (match.venue || match.Venue),
  );

const getMatchDateValue = (match) =>
  match?.scheduledAt || match?.matchDate || match?.date || null;

const toValidDate = (value) => {
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

const getVenueText = (match) => {
  const venue = match?.venue || match?.Venue;
  if (!venue) return "Venue not set";
  return [venue.name, venue.city].filter(Boolean).join(", ");
};

const getCompetitionName = (match) =>
  match?.competition?.name || match?.Competition?.name || "Competition";

const formatDateBadge = (value) => {
  const date = toValidDate(value);
  if (!date) {
    return { weekday: "-", day: "--", month: "---", time: "--:--" };
  }

  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

const isLeadRole = (role) =>
  ["first_referee", "head", "main", "lead_referee"].includes(role);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: assignmentsData, isLoading: assignmentsLoading } =
    useMyAssignments();
  const { data: statisticsData, isLoading: statsLoading } = useMyStatistics();

  const rawAssignments = useMemo(
    () => assignmentsData?.data || [],
    [assignmentsData?.data],
  );

  const missingMatchIds = useMemo(() => {
    const ids = rawAssignments
      .filter((assignment) => !hasMatchDetails(getMatch(assignment)))
      .map(getAssignmentMatchId)
      .filter(Boolean);

    return [...new Set(ids)];
  }, [rawAssignments]);

  const matchDetailQueries = useQueries({
    queries: missingMatchIds.map((id) => ({
      queryKey: ["matches", "detail", id, "referee-dashboard"],
      queryFn: () => matchesApi.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const hydratedMatchesById = useMemo(() => {
    return matchDetailQueries.reduce((acc, query, index) => {
      const match = query.data?.data;
      if (match) {
        acc[missingMatchIds[index]] = match;
      }
      return acc;
    }, {});
  }, [matchDetailQueries, missingMatchIds]);

  const assignments = useMemo(
    () =>
      rawAssignments.map((assignment) => {
        const match = getMatch(assignment);
        if (hasMatchDetails(match)) return assignment;

        const hydratedMatch =
          hydratedMatchesById[getAssignmentMatchId(assignment)];
        if (!hydratedMatch) return assignment;

        return {
          ...assignment,
          match: hydratedMatch,
        };
      }),
    [hydratedMatchesById, rawAssignments],
  );

  const statistics = useMemo(
    () =>
      statisticsData?.data || {
        total: 0,
        accepted: 0,
        declined: 0,
        pending: 0,
      },
    [statisticsData?.data],
  );

  const pendingDelegations = useMemo(
    () => assignments.filter((assignment) => assignment.status === "pending"),
    [assignments],
  );

  const upcomingMatches = useMemo(() => {
    const now = new Date();

    return assignments
      .filter((assignment) => {
        const matchDate = toValidDate(getMatchDateValue(getMatch(assignment)));
        return matchDate && matchDate >= now;
      })
      .sort((a, b) => {
        const firstDate = toValidDate(getMatchDateValue(getMatch(a)));
        const secondDate = toValidDate(getMatchDateValue(getMatch(b)));
        return firstDate - secondDate;
      })
      .slice(0, 5);
  }, [assignments]);

  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthMatches = assignments.filter((assignment) => {
      const matchDate = toValidDate(getMatchDateValue(getMatch(assignment)));
      return (
        matchDate &&
        matchDate.getMonth() === currentMonth &&
        matchDate.getFullYear() === currentYear
      );
    });

    return {
      thisMonth: thisMonthMatches.length,
      upcoming: upcomingMatches.length,
      asLead: assignments.filter((assignment) => isLeadRole(assignment.role))
        .length,
      seasonTotal: statistics.total || assignments.length,
    };
  }, [assignments, statistics.total, upcomingMatches.length]);

  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    const days = [];

    for (let index = 0; index < startOffset; index += 1) {
      days.push({ day: null, type: "empty" });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const hasMatch = assignments.some((assignment) => {
        const matchDate = toValidDate(getMatchDateValue(getMatch(assignment)));
        return (
          matchDate &&
          matchDate.getDate() === day &&
          matchDate.getMonth() === month &&
          matchDate.getFullYear() === year
        );
      });

      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        day,
        type: hasMatch ? "match" : "normal",
        isToday,
      });
    }

    return days;
  }, [assignments, calendarMonth]);

  const stats = [
    {
      label: "Matches this month",
      value: currentMonthStats.thisMonth,
      icon: CalendarIcon,
      color: COLORS.orange,
      bg: "rgba(249, 115, 22, 0.12)",
    },
    {
      label: "Upcoming matches",
      value: currentMonthStats.upcoming,
      icon: TrendingIcon,
      color: COLORS.blue,
      bg: "rgba(59, 130, 246, 0.12)",
    },
    {
      label: "As lead referee",
      value: currentMonthStats.asLead,
      icon: StarIcon,
      color: COLORS.purple,
      bg: "rgba(168, 85, 247, 0.12)",
    },
    {
      label: "Season total",
      value: currentMonthStats.seasonTotal,
      icon: TrophyIcon,
      color: COLORS.green,
      bg: "rgba(34, 197, 94, 0.12)",
    },
  ];

  const handlePrevMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
    );
  };

  const matchDetailsLoading = matchDetailQueries.some(
    (query) => query.isLoading || query.isFetching,
  );

  if (assignmentsLoading || statsLoading || matchDetailsLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
        <DashboardHeader user={user} />

        {pendingDelegations.length > 0 && (
          <PendingBanner
            count={pendingDelegations.length}
            onView={() => navigate("/referee/pending")}
          />
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2.5,
            mb: 3,
          }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 2fr) 520px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <UpcomingMatchesCard
            assignments={upcomingMatches}
            onViewAll={() => navigate("/referee/schedule")}
            onPending={() => navigate("/referee/pending")}
          />

          <Stack spacing={3}>
            <CalendarCard
              calendarData={calendarData}
              calendarMonth={calendarMonth}
              isSmall={isSmall}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
            <AssignmentStatusCard statistics={statistics} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const DashboardHeader = ({ user }) => (
  <Box
    sx={{
      mb: 3.5,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component='h1'
        sx={{
          fontSize: { xs: "1.6rem", md: "2rem" },
          lineHeight: 1.08,
          fontWeight: 700,
          color: COLORS.text,
        }}
      >
        Welcome, {user?.firstName || "Referee"}!
      </Typography>
      <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
        Review your schedule and notifications
      </Typography>
    </Box>
  </Box>
);

const PendingBanner = ({ count, onView }) => (
  <Paper
    elevation={0}
    sx={{
      mb: 3,
      p: { xs: 2, md: 2.5 },
      borderRadius: "8px",
      bgcolor: "rgba(234, 179, 8, 0.09)",
      border: "1px solid rgba(234, 179, 8, 0.24)",
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      gap: 2,
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: "rgba(234, 179, 8, 0.16)",
          color: COLORS.warning,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WarningIcon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: COLORS.warning, fontWeight: 800 }}>
          You have {count} pending assignment{count === 1 ? "" : "s"}
        </Typography>
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.25 }}>
          Please accept or decline within 24 hours.
        </Typography>
      </Box>
    </Box>

    <Button
      onClick={onView}
      sx={{
        px: 2.5,
        py: 1,
        borderRadius: "8px",
        color: COLORS.warning,
        bgcolor: "rgba(234, 179, 8, 0.14)",
        textTransform: "none",
        fontWeight: 800,
        width: { xs: "100%", sm: "auto" },
        "&:hover": { bgcolor: "rgba(234, 179, 8, 0.22)" },
      }}
    >
      View
    </Button>
  </Paper>
);

const StatCard = ({ stat }) => {
  const Icon = stat.icon;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        minHeight: 142,
        borderRadius: "16px",
        bgcolor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "12px",
          bgcolor: stat.bg,
          color: stat.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Box sx={{ mt: 2.75 }}>
        <Typography sx={{ fontSize: 34, lineHeight: 1, fontWeight: 800 }}>
          {stat.value}
        </Typography>
        <Typography
          sx={{
            color: COLORS.mutedStrong,
            mt: 1.25,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {stat.label}
        </Typography>
      </Box>
    </Paper>
  );
};

const UpcomingMatchesCard = ({ assignments, onViewAll, onPending }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
      minHeight: 410,
    }}
  >
    <Box
      sx={{
        px: { xs: 2.25, md: 3 },
        py: 2.25,
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
        Upcoming Matches
      </Typography>
      <Button
        onClick={onViewAll}
        sx={{
          color: COLORS.orange,
          textTransform: "none",
          fontWeight: 800,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "rgba(249, 115, 22, 0.08)" },
        }}
      >
        View all {">"}
      </Button>
    </Box>

    {assignments.length === 0 ? (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
        }}
      >
        <BasketballIcon sx={{ fontSize: 54, color: COLORS.muted, mb: 1.5 }} />
        <Typography sx={{ color: COLORS.text, fontWeight: 700 }}>
          No upcoming matches
        </Typography>
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.5 }}>
          New assignments will appear here when they are delegated.
        </Typography>
      </Box>
    ) : (
      <Box>
        {assignments.map((assignment, index) => (
          <MatchRow
            key={assignment.id || index}
            assignment={assignment}
            isLast={index === assignments.length - 1}
            onPending={onPending}
          />
        ))}
      </Box>
    )}
  </Paper>
);

const MatchRow = ({ assignment, isLast, onPending }) => {
  const match = getMatch(assignment);
  const matchDate = getMatchDateValue(match);
  const dateInfo = formatDateBadge(matchDate);
  const role = getRefereeRoleBadge(assignment.role);
  const status = getRefereeAssignmentStatusBadge(assignment.status);
  const isPending = assignment.status === "pending";

  return (
    <Box
      onClick={isPending ? onPending : undefined}
      sx={{
        px: { xs: 2.25, md: 3 },
        py: 2.25,
        borderBottom: isLast ? "none" : `1px solid ${COLORS.borderSoft}`,
        cursor: isPending ? "pointer" : "default",
        transition: "background-color 0.16s ease",
        "&:hover": { bgcolor: COLORS.cardHover },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "72px minmax(0, 1fr)",
            md: "76px 1px minmax(0, 1fr) auto",
          },
          alignItems: "center",
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <DateBlock dateInfo={dateInfo} />

        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 1,
            height: 58,
            bgcolor: COLORS.border,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            <TinyBadge
              label={getCompetitionName(match)}
              color={COLORS.orange}
            />
            <TinyBadge label={role.label} color={role.color} />
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              color: COLORS.text,
              fontSize: { xs: "0.95rem", md: "1rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { xs: "normal", sm: "nowrap" },
            }}
          >
            {getTeamName(match, "home")} vs {getTeamName(match, "away")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexWrap: "wrap",
              mt: 0.75,
              color: COLORS.mutedStrong,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationIcon sx={{ fontSize: 15, color: COLORS.muted }} />
              <Typography sx={{ fontSize: 13 }}>
                {getVenueText(match)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: 15, color: COLORS.muted }} />
              <Typography sx={{ fontSize: 13 }}>{dateInfo.time}</Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            gridColumn: { xs: "2 / 3", md: "auto" },
            justifySelf: { xs: "start", md: "end" },
          }}
        >
          <StatusPill status={status} />
        </Box>
      </Box>
    </Box>
  );
};

const DateBlock = ({ dateInfo }) => (
  <Box
    sx={{
      textAlign: "center",
      minWidth: 72,
    }}
  >
    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: 12,
        textTransform: "uppercase",
        fontWeight: 800,
      }}
    >
      {dateInfo.weekday}
    </Typography>
    <Typography sx={{ color: COLORS.text, fontSize: 23, fontWeight: 800 }}>
      {dateInfo.day}
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
      {dateInfo.month}
    </Typography>
  </Box>
);

const TinyBadge = ({ label, color }) => (
  <Chip
    label={label}
    size='small'
    sx={{
      height: 24,
      borderRadius: "6px",
      bgcolor: `${color}1f`,
      color,
      fontWeight: 800,
      fontSize: 12,
      maxWidth: 180,
      "& .MuiChip-label": {
        px: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }}
  />
);

const StatusPill = ({ status }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      px: 1.75,
      py: 0.75,
      borderRadius: "999px",
      bgcolor: `${status.color}1f`,
      color: status.color,
      fontSize: 13,
      fontWeight: 800,
      whiteSpace: "nowrap",
    }}
  >
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: status.color,
      }}
    />
    {status.label}
  </Box>
);

const CalendarCard = ({
  calendarData,
  calendarMonth,
  isSmall,
  onPrev,
  onNext,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.25, md: 3 },
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
        {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton size='small' onClick={onPrev} sx={calendarButtonSx}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton size='small' onClick={onNext} sx={calendarButtonSx}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0.75,
        mb: 1,
      }}
    >
      {dayNames.map((day) => (
        <Box key={day} sx={{ textAlign: "center", py: 0.75 }}>
          <Typography
            sx={{ color: COLORS.muted, fontSize: 12, fontWeight: 700 }}
          >
            {isSmall ? day.charAt(0) : day}
          </Typography>
        </Box>
      ))}
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0.75,
      }}
    >
      {calendarData.map((dayData, index) => (
        <CalendarDay
          key={`${dayData.day || "empty"}-${index}`}
          dayData={dayData}
        />
      ))}
    </Box>

    <Box
      sx={{
        mt: 3,
        pt: 2.25,
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        gap: 3,
        flexWrap: "wrap",
      }}
    >
      <LegendDot color={COLORS.orange} label='Match' />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 17,
            height: 17,
            borderRadius: "5px",
            border: `2px solid ${COLORS.green}`,
          }}
        />
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
          Today
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const calendarButtonSx = {
  color: COLORS.mutedStrong,
  borderRadius: "8px",
  "&:hover": {
    color: COLORS.text,
    bgcolor: "rgba(255, 255, 255, 0.06)",
  },
};

const CalendarDay = ({ dayData }) => {
  if (dayData.type === "empty") {
    return <Box sx={{ minHeight: { xs: 34, sm: 42 } }} />;
  }

  const isMatch = dayData.type === "match";

  return (
    <Tooltip title={isMatch ? "Match scheduled" : ""} arrow disableInteractive>
      <Box
        sx={{
          minHeight: { xs: 34, sm: 42 },
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: isMatch ? COLORS.orange : COLORS.text,
          bgcolor: isMatch ? "rgba(249, 115, 22, 0.14)" : "transparent",
          border: dayData.isToday
            ? `2px solid ${COLORS.green}`
            : isMatch
              ? "1px solid rgba(249, 115, 22, 0.28)"
              : "1px solid transparent",
          fontWeight: dayData.isToday || isMatch ? 800 : 600,
          cursor: isMatch ? "pointer" : "default",
          transition: "background-color 0.16s ease, border-color 0.16s ease",
          "&:hover": {
            bgcolor: isMatch
              ? "rgba(249, 115, 22, 0.2)"
              : "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: "inherit" }}>
          {dayData.day}
        </Typography>
        {isMatch && (
          <Box
            sx={{
              position: "absolute",
              bottom: 5,
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: COLORS.orange,
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

const AssignmentStatusCard = ({ statistics }) => {
  const statusRows = [
    {
      label: "Accepted",
      value: statistics.accepted || 0,
      color: COLORS.green,
      icon: CheckIcon,
    },
    {
      label: "Pending",
      value: statistics.pending || 0,
      color: COLORS.warning,
      icon: WarningIcon,
    },
    {
      label: "Declined",
      value: statistics.declined || 0,
      color: COLORS.red,
      icon: null,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: "16px",
        bgcolor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Typography sx={{ fontSize: 17, fontWeight: 700, mb: 2 }}>
        Assignment Status
      </Typography>
      <Stack spacing={1.75}>
        {statusRows.map((row) => {
          const Icon = row.icon;
          return (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                {Icon ? (
                  <Icon sx={{ color: row.color, fontSize: 21 }} />
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: `${row.color}24`,
                      color: row.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    x
                  </Box>
                )}
                <Typography sx={{ color: COLORS.mutedStrong, fontWeight: 600 }}>
                  {row.label}
                </Typography>
              </Box>
              <Typography sx={{ color: COLORS.text, fontWeight: 800 }}>
                {row.value}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

const LegendDot = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: color,
      }}
    />
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
      {label}
    </Typography>
  </Box>
);

export default DashboardPage;
