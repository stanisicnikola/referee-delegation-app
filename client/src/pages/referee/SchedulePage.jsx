import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Grid,
  Stack,
  AvatarGroup,
  Tooltip,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  SportsSoccer as SoccerIcon,
} from "@mui/icons-material";
import { useMyAssignments, useCompetitions } from "../../hooks";

// Orange accent for referee panel
const ACCENT_COLOR = "#f97316";

const SchedulePage = () => {
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const _isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Filters
  const [selectedCompetition, setSelectedCompetition] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("upcoming");

  // Fetch data
  const { data: assignmentsData, isLoading: assignmentsLoading } =
    useMyAssignments();
  const { data: competitionsData } = useCompetitions();

  const assignments = useMemo(
    () => assignmentsData?.data || [],
    [assignmentsData?.data]
  );
  const competitions = competitionsData?.data || [];

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];
    const now = new Date();

    // Filter by period
    if (selectedPeriod === "upcoming") {
      filtered = filtered.filter(
        (a) => a.match && new Date(a.match.scheduledAt) >= now
      );
    } else if (selectedPeriod === "past") {
      filtered = filtered.filter(
        (a) => a.match && new Date(a.match.scheduledAt) < now
      );
    }

    // Filter by competition
    if (selectedCompetition !== "all") {
      filtered = filtered.filter(
        (a) => a.match?.competitionId === parseInt(selectedCompetition)
      );
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((a) => a.role === selectedRole);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.match?.scheduledAt || 0);
      const dateB = new Date(b.match?.scheduledAt || 0);
      return selectedPeriod === "past" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [assignments, selectedCompetition, selectedRole, selectedPeriod]);

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups = {};

    filteredAssignments.forEach((assignment) => {
      if (!assignment.match) return;
      const date = new Date(assignment.match.scheduledAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthKey]) {
        groups[monthKey] = { name: monthName, matches: [] };
      }
      groups[monthKey].matches.push(assignment);
    });

    return Object.entries(groups).sort((a, b) => {
      return selectedPeriod === "past"
        ? b[0].localeCompare(a[0])
        : a[0].localeCompare(b[0]);
    });
  }, [filteredAssignments, selectedPeriod]);

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "head", label: "Head Referee" },
    { value: "main", label: "Main Referee" },
    { value: "assistant", label: "Assistant" },
    { value: "second", label: "2nd Referee" },
    { value: "third", label: "3rd Referee" },
    { value: "fourth", label: "4th Official" },
  ];

  const periods = [
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
    { value: "all", label: "All" },
  ];

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
    const roleMap = {
      head: { label: "Head Referee", color: "#22c55e" },
      main: { label: "Head Referee", color: "#22c55e" },
      assistant: { label: "Assistant", color: "#3b82f6" },
      second: { label: "2nd Referee", color: "#3b82f6" },
      third: { label: "3rd Referee", color: "#8b5cf6" },
      fourth: { label: "4th Official", color: "#ec4899" },
    };
    return roleMap[role] || { label: role || "Referee", color: "grey" };
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "Pending", color: ACCENT_COLOR },
      accepted: { label: "Confirmed", color: "#22c55e" },
      confirmed: { label: "Confirmed", color: "#22c55e" },
      declined: { label: "Declined", color: "#ef4444" },
      completed: { label: "Completed", color: "#6b7280" },
    };
    return statuses[status] || { label: status || "Unknown", color: "grey" };
  };

  const handleExportCalendar = () => {
    // TODO: Implement calendar export
    console.log("Exporting calendar...");
  };

  if (assignmentsLoading) {
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
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant='h5' fontWeight={600} color='white'>
            My Schedule
          </Typography>
          <Typography variant='body2' color='grey.400'>
            View all your assigned matches
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<DownloadIcon />}
          onClick={handleExportCalendar}
          sx={{
            borderColor: "rgba(255,255,255,0.2)",
            color: "white",
            "&:hover": {
              borderColor: ACCENT_COLOR,
              bgcolor: "rgba(249, 115, 22, 0.1)",
            },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Export Calendar
        </Button>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 2,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Grid container spacing={2} alignItems='center'>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel sx={{ color: "grey.400" }}>Period</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                label='Period'
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "& .MuiSvgIcon-root": { color: "grey.400" },
                }}
              >
                {periods.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel sx={{ color: "grey.400" }}>Competition</InputLabel>
              <Select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
                label='Competition'
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "& .MuiSvgIcon-root": { color: "grey.400" },
                }}
              >
                <MenuItem value='all'>All Competitions</MenuItem>
                {competitions.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel sx={{ color: "grey.400" }}>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label='Role'
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "& .MuiSvgIcon-root": { color: "grey.400" },
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant='body2' color='grey.400'>
          {filteredAssignments.length} match
          {filteredAssignments.length !== 1 ? "es" : ""} found
        </Typography>
      </Box>

      {/* Schedule List */}
      {filteredAssignments.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <CalendarIcon sx={{ fontSize: 64, color: "grey.600", mb: 2 }} />
          <Typography variant='h6' color='grey.400' gutterBottom>
            No matches found
          </Typography>
          <Typography variant='body2' color='grey.500'>
            Try adjusting your filters or check back later for new assignments
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {groupedByMonth.map(([monthKey, group]) => (
            <Box key={monthKey}>
              {/* Month Header */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Typography variant='h6' color='white' fontWeight={600}>
                  {group.name}
                </Typography>
                <Chip
                  size='small'
                  label={`${group.matches.length} match${
                    group.matches.length !== 1 ? "es" : ""
                  }`}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "grey.300",
                  }}
                />
              </Box>

              {/* Matches */}
              <Stack spacing={2}>
                {group.matches.map((assignment) => {
                  const match = assignment.match;
                  const dateInfo = formatDate(match?.scheduledAt);
                  const roleBadge = getRoleBadge(assignment.role);
                  const statusBadge = getStatusBadge(assignment.status);

                  return (
                    <Paper
                      key={assignment.id}
                      sx={{
                        p: 2,
                        bgcolor: "rgba(255,255,255,0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.1)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexDirection: { xs: "column", md: "row" },
                          alignItems: { xs: "flex-start", md: "center" },
                        }}
                      >
                        {/* Date Box */}
                        <Box
                          sx={{
                            minWidth: 70,
                            textAlign: "center",
                            bgcolor: "rgba(249, 115, 22, 0.1)",
                            borderRadius: 1.5,
                            p: 1.5,
                            border: `1px solid ${ACCENT_COLOR}30`,
                          }}
                        >
                          <Typography
                            variant='caption'
                            color={ACCENT_COLOR}
                            fontWeight={500}
                          >
                            {dateInfo.month}
                          </Typography>
                          <Typography
                            variant='h4'
                            color='white'
                            fontWeight={700}
                          >
                            {dateInfo.day}
                          </Typography>
                          <Typography variant='caption' color='grey.500'>
                            {dateInfo.weekday}
                          </Typography>
                        </Box>

                        {/* Match Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              variant='h6'
                              color='white'
                              fontWeight={600}
                            >
                              {match?.homeTeam?.name || "TBD"} vs{" "}
                              {match?.awayTeam?.name || "TBD"}
                            </Typography>
                            {match?.homeScore !== null &&
                              match?.awayScore !== null && (
                                <Chip
                                  size='small'
                                  label={`${match.homeScore} - ${match.awayScore}`}
                                  sx={{
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    color: "white",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
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
                                sx={{ fontSize: 16, color: "grey.500" }}
                              />
                              <Typography variant='body2' color='grey.400'>
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
                                  sx={{ fontSize: 16, color: "grey.500" }}
                                />
                                <Typography variant='body2' color='grey.400'>
                                  {match.venue.name}
                                </Typography>
                              </Box>
                            )}
                            {match?.competition && (
                              <Chip
                                size='small'
                                label={match.competition.name}
                                sx={{
                                  bgcolor: "rgba(255,255,255,0.05)",
                                  color: "grey.400",
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Role & Status Badges */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "row", md: "column" },
                            gap: 1,
                            alignItems: { xs: "center", md: "flex-end" },
                          }}
                        >
                          <Chip
                            size='small'
                            label={roleBadge.label}
                            sx={{
                              bgcolor: `${roleBadge.color}20`,
                              color: roleBadge.color,
                              fontWeight: 600,
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
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SchedulePage;
