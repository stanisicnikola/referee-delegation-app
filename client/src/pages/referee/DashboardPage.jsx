import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Grid,
  Stack,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  SportsSoccer as SoccerIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context";
import { useMyAssignments, useMyStatistics } from "../../hooks";

// Orange accent for referee panel
const ACCENT_COLOR = "#f97316";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Fetch real data from API
  const { data: assignmentsData, isLoading: assignmentsLoading } =
    useMyAssignments();
  const { data: statisticsData, isLoading: statsLoading } = useMyStatistics();

  const isLoading = assignmentsLoading || statsLoading;

  // Process assignments data with useMemo
  const assignments = useMemo(
    () => assignmentsData?.data || [],
    [assignmentsData?.data]
  );
  const statistics = useMemo(
    () =>
      statisticsData?.data || {
        total: 0,
        accepted: 0,
        declined: 0,
        pending: 0,
      },
    [statisticsData?.data]
  );

  // Filter upcoming matches (future dates)
  const upcomingMatches = useMemo(() => {
    return assignments
      .filter(
        (a) =>
          a.match &&
          new Date(a.match.scheduledAt || a.match.matchDate) > new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.match.scheduledAt || a.match.matchDate) -
          new Date(b.match.scheduledAt || b.match.matchDate)
      )
      .slice(0, 5);
  }, [assignments]);

  // Pending delegations (assignments with pending status)
  const pendingDelegations = useMemo(() => {
    return assignments.filter((a) => a.status === "pending");
  }, [assignments]);

  // Calculate stats for current month
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthMatches = assignments.filter((a) => {
      if (!a.match) return false;
      const matchDate = new Date(a.match.scheduledAt);
      return (
        matchDate.getMonth() === currentMonth &&
        matchDate.getFullYear() === currentYear
      );
    });

    const asHeadReferee = assignments.filter(
      (a) => a.role === "head" || a.role === "main"
    ).length;

    return {
      thisMonth: thisMonthMatches.length,
      upcoming: upcomingMatches.length,
      asHead: asHeadReferee,
      seasonTotal: statistics.total || assignments.length,
    };
  }, [assignments, upcomingMatches, statistics]);

  // Calendar data
  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Empty cells
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, type: "empty" });
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      // Check if there's a match on this day
      const hasMatch = assignments.some((a) => {
        if (!a.match) return false;
        const matchDate = new Date(a.match.scheduledAt);
        return (
          matchDate.getDate() === day &&
          matchDate.getMonth() === month &&
          matchDate.getFullYear() === year
        );
      });

      days.push({
        day,
        type: hasMatch ? "match" : "normal",
        date: dateStr,
      });
    }

    return days;
  }, [calendarMonth, assignments]);

  const formatDate = (dateString) => {
    if (!dateString) return { day: "-", month: "-", weekday: "-", time: "-" };
    const date = new Date(dateString);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      weekday: weekdays[date.getDay()],
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const getRoleBadge = (role) => {
    const roles = {
      head: { label: "Head Referee", color: "#22c55e" },
      main: { label: "Head Referee", color: "#22c55e" },
      assistant: { label: "Assistant", color: "#3b82f6" },
      second: { label: "2nd Referee", color: "#3b82f6" },
      third: { label: "3rd Referee", color: "#8b5cf6" },
      fourth: { label: "4th Official", color: "#ec4899" },
    };
    return roles[role] || { label: role || "Referee", color: "grey" };
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "Pending", color: ACCENT_COLOR },
      accepted: { label: "Confirmed", color: "#22c55e" },
      confirmed: { label: "Confirmed", color: "#22c55e" },
      declined: { label: "Declined", color: "#ef4444" },
    };
    return statuses[status] || { label: status || "Unknown", color: "grey" };
  };

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: ACCENT_COLOR }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5' fontWeight={600} color='white'>
          Welcome, {user?.firstName || "Referee"}!
        </Typography>
        <Typography variant='body2' color='grey.400'>
          Here&apos;s your overview for today
        </Typography>
      </Box>

      {/* Pending Alert */}
      {pendingDelegations.length > 0 && (
        <Alert
          severity='warning'
          sx={{
            mb: 3,
            bgcolor: "rgba(249, 115, 22, 0.1)",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            "& .MuiAlert-icon": { color: ACCENT_COLOR },
          }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => navigate("/referee/pending")}
              sx={{ color: ACCENT_COLOR }}
            >
              View All
            </Button>
          }
        >
          You have {pendingDelegations.length} pending delegation
          {pendingDelegations.length > 1 ? "s" : ""} waiting for your response
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "This Month",
            value: currentMonthStats.thisMonth,
            icon: CalendarIcon,
            color: ACCENT_COLOR,
          },
          {
            label: "Upcoming",
            value: currentMonthStats.upcoming,
            icon: TrendingIcon,
            color: "#3b82f6",
          },
          {
            label: "As Head Referee",
            value: currentMonthStats.asHead,
            icon: StarIcon,
            color: "#22c55e",
          },
          {
            label: "Season Total",
            value: currentMonthStats.seasonTotal,
            icon: TrophyIcon,
            color: "#8b5cf6",
          },
        ].map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.1)",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{ bgcolor: `${stat.color}20`, width: 48, height: 48 }}
                  >
                    <IconComponent sx={{ color: stat.color }} />
                  </Avatar>
                  <Box>
                    <Typography variant='h4' color='white' fontWeight={600}>
                      {stat.value}
                    </Typography>
                    <Typography variant='caption' color='grey.400'>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Matches */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant='h6' color='white' fontWeight={600}>
                Upcoming Matches
              </Typography>
              <Button
                size='small'
                onClick={() => navigate("/referee/schedule")}
                sx={{ color: ACCENT_COLOR }}
              >
                View All
              </Button>
            </Box>

            {upcomingMatches.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <SoccerIcon sx={{ fontSize: 48, color: "grey.600", mb: 2 }} />
                <Typography color='grey.400'>No upcoming matches</Typography>
              </Box>
            ) : (
              <Stack spacing={0}>
                {upcomingMatches.map((assignment) => {
                  const match = assignment.match;
                  const dateInfo = formatDate(match?.scheduledAt);
                  const roleBadge = getRoleBadge(assignment.role);
                  const statusBadge = getStatusBadge(assignment.status);

                  return (
                    <Box
                      key={assignment.id}
                      sx={{
                        display: "flex",
                        gap: 2,
                        p: 2,
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      {/* Date Box */}
                      <Box
                        sx={{
                          minWidth: 60,
                          textAlign: "center",
                          bgcolor: "rgba(249, 115, 22, 0.1)",
                          borderRadius: 1.5,
                          p: 1,
                        }}
                      >
                        <Typography
                          variant='caption'
                          color={ACCENT_COLOR}
                          fontWeight={500}
                        >
                          {dateInfo.month}
                        </Typography>
                        <Typography variant='h5' color='white' fontWeight={600}>
                          {dateInfo.day}
                        </Typography>
                        <Typography variant='caption' color='grey.500'>
                          {dateInfo.weekday}
                        </Typography>
                      </Box>

                      {/* Match Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant='body1'
                          color='white'
                          fontWeight={500}
                        >
                          {match?.homeTeam?.name || "TBD"} vs{" "}
                          {match?.awayTeam?.name || "TBD"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <TimeIcon
                              sx={{ fontSize: 14, color: "grey.500" }}
                            />
                            <Typography variant='caption' color='grey.400'>
                              {dateInfo.time}
                            </Typography>
                          </Box>
                          {match?.venue && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationIcon
                                sx={{ fontSize: 14, color: "grey.500" }}
                              />
                              <Typography variant='caption' color='grey.400'>
                                {match.venue.name}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {match?.competition && (
                          <Typography
                            variant='caption'
                            color='grey.500'
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {match.competition.name}
                          </Typography>
                        )}
                      </Box>

                      {/* Badges */}
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          size='small'
                          label={roleBadge.label}
                          sx={{
                            bgcolor: `${roleBadge.color}20`,
                            color: roleBadge.color,
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          size='small'
                          label={statusBadge.label}
                          sx={{
                            bgcolor: `${statusBadge.color}20`,
                            color: statusBadge.color,
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Calendar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Calendar Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant='h6' color='white' fontWeight={600}>
                {monthNames[calendarMonth.getMonth()]}{" "}
                {calendarMonth.getFullYear()}
              </Typography>
              <Box>
                <IconButton
                  onClick={handlePrevMonth}
                  sx={{ color: "grey.400" }}
                  size='small'
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextMonth}
                  sx={{ color: "grey.400" }}
                  size='small'
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ p: 2 }}>
              {/* Day Names */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.5,
                  mb: 1,
                }}
              >
                {dayNames.map((day) => (
                  <Box key={day} sx={{ textAlign: "center", py: 0.5 }}>
                    <Typography
                      variant='caption'
                      color='grey.500'
                      fontWeight={500}
                    >
                      {isSmall ? day.charAt(0) : day}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Calendar Days */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.5,
                }}
              >
                {calendarData.map((dayData, index) => {
                  if (dayData.type === "empty") {
                    return <Box key={`empty-${index}`} />;
                  }

                  const isToday = (() => {
                    const today = new Date();
                    return (
                      dayData.day === today.getDate() &&
                      calendarMonth.getMonth() === today.getMonth() &&
                      calendarMonth.getFullYear() === today.getFullYear()
                    );
                  })();

                  return (
                    <Tooltip
                      key={dayData.day}
                      title={dayData.type === "match" ? "Match scheduled" : ""}
                      arrow
                    >
                      <Box
                        sx={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 1,
                          bgcolor:
                            dayData.type === "match"
                              ? "rgba(249, 115, 22, 0.2)"
                              : "transparent",
                          border: isToday
                            ? "2px solid white"
                            : dayData.type === "match"
                            ? `1px solid ${ACCENT_COLOR}40`
                            : "1px solid transparent",
                          cursor:
                            dayData.type === "match" ? "pointer" : "default",
                          position: "relative",
                          "&:hover": {
                            bgcolor:
                              dayData.type === "match"
                                ? "rgba(249, 115, 22, 0.3)"
                                : "rgba(255,255,255,0.05)",
                          },
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{
                            color:
                              dayData.type === "match"
                                ? ACCENT_COLOR
                                : isToday
                                ? "white"
                                : "grey.400",
                            fontWeight:
                              isToday || dayData.type === "match" ? 600 : 400,
                          }}
                        >
                          {dayData.day}
                        </Typography>
                        {dayData.type === "match" && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: ACCENT_COLOR,
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>

              {/* Legend */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      bgcolor: "rgba(249, 115, 22, 0.2)",
                      border: `1px solid ${ACCENT_COLOR}40`,
                    }}
                  />
                  <Typography variant='caption' color='grey.400'>
                    Match
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      border: "2px solid white",
                    }}
                  />
                  <Typography variant='caption' color='grey.400'>
                    Today
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Quick Stats */}
          <Paper
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography
              variant='subtitle2'
              color='white'
              fontWeight={600}
              gutterBottom
            >
              Assignment Status
            </Typography>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 18, color: "#22c55e" }} />
                  <Typography variant='body2' color='grey.300'>
                    Accepted
                  </Typography>
                </Box>
                <Typography variant='body2' color='white' fontWeight={600}>
                  {statistics.accepted}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WarningIcon sx={{ fontSize: 18, color: ACCENT_COLOR }} />
                  <Typography variant='body2' color='grey.300'>
                    Pending
                  </Typography>
                </Box>
                <Typography variant='body2' color='white' fontWeight={600}>
                  {statistics.pending}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='white'
                      sx={{ fontSize: 10, fontWeight: 600 }}
                    >
                      ✕
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='grey.300'>
                    Declined
                  </Typography>
                </Box>
                <Typography variant='body2' color='white' fontWeight={600}>
                  {statistics.declined}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
