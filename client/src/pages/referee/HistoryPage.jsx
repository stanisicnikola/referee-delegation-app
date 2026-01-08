import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  SportsSoccer as SoccerIcon,
  EmojiEvents as TrophyIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import {
  useMyAssignments,
  useCompetitions,
  useMyStatistics,
} from "../../hooks";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { hr } from "date-fns/locale";

// Orange accent for referee panel
const ACCENT_COLOR = "#f97316";

const HistoryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Filters
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // API hooks
  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useMyAssignments();

  const { data: competitionsData } = useCompetitions();
  const { data: statisticsData } = useMyStatistics();

  // Filter for past matches only
  const pastMatches = useMemo(() => {
    if (!assignmentsData?.data) return [];

    const today = startOfDay(new Date());

    return assignmentsData.data.filter((assignment) => {
      const match = assignment.match || assignment.Match;
      if (!match) return false;

      const matchDate = match.matchDate || match.date;
      if (!matchDate) return false;

      const matchDateTime = parseISO(matchDate);
      return isBefore(matchDateTime, today);
    });
  }, [assignmentsData]);

  // Apply filters
  const filteredMatches = useMemo(() => {
    return pastMatches.filter((assignment) => {
      const match = assignment.match || assignment.Match;
      const homeTeam = match?.homeTeam?.name || match?.HomeTeam?.name || "";
      const awayTeam = match?.awayTeam?.name || match?.AwayTeam?.name || "";
      const competition = match?.competition || match?.Competition;
      const venue = match?.venue?.name || match?.Venue?.name || "";

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          homeTeam.toLowerCase().includes(searchLower) ||
          awayTeam.toLowerCase().includes(searchLower) ||
          venue.toLowerCase().includes(searchLower) ||
          (competition?.name || "").toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Competition filter
      if (competitionFilter !== "all") {
        if (competition?.id !== competitionFilter) return false;
      }

      // Role filter
      if (roleFilter !== "all") {
        if (assignment.role !== roleFilter) return false;
      }

      return true;
    });
  }, [pastMatches, search, competitionFilter, roleFilter]);

  // Paginated data
  const paginatedMatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredMatches.slice(start, start + rowsPerPage);
  }, [filteredMatches, page, rowsPerPage]);

  // Get unique roles from data
  const uniqueRoles = useMemo(() => {
    const roles = new Set();
    pastMatches.forEach((a) => {
      if (a.role) roles.add(a.role);
    });
    return Array.from(roles);
  }, [pastMatches]);

  const isLoading = assignmentsLoading;
  const error = assignmentsError;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          Greška pri učitavanju povijesti: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
          Povijest suđenja
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Pregled svih odrađenih utakmica
        </Typography>
      </Box>

      {/* Statistics Summary */}
      {statisticsData?.data && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <StatCard
            icon={<SoccerIcon />}
            label='Ukupno utakmica'
            value={statisticsData.data.totalMatches || pastMatches.length}
            color={ACCENT_COLOR}
          />
          <StatCard
            icon={<TrophyIcon />}
            label='Ova sezona'
            value={statisticsData.data.matchesThisSeason || 0}
            color='#22c55e'
          />
          <StatCard
            icon={<CalendarIcon />}
            label='Ovaj mjesec'
            value={statisticsData.data.matchesThisMonth || 0}
            color='#3b82f6'
          />
        </Stack>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            placeholder='Pretraži timove, lokacije...'
            size='small'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size='small' sx={{ minWidth: 180 }}>
            <InputLabel>Natjecanje</InputLabel>
            <Select
              value={competitionFilter}
              label='Natjecanje'
              onChange={(e) => {
                setCompetitionFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value='all'>Sva natjecanja</MenuItem>
              {competitionsData?.data?.map((comp) => (
                <MenuItem key={comp.id} value={comp.id}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Uloga</InputLabel>
            <Select
              value={roleFilter}
              label='Uloga'
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value='all'>Sve uloge</MenuItem>
              {uniqueRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {getRoleName(role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            label={`${filteredMatches.length} utakmica`}
            size='small'
            sx={{ ml: "auto" }}
          />
        </Stack>
      </Paper>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <SoccerIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant='h6' color='text.secondary' gutterBottom>
            {pastMatches.length === 0
              ? "Nema odrađenih utakmica"
              : "Nema rezultata za odabrane filtere"}
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            {pastMatches.length === 0
              ? "Vaše odrađene utakmice će se pojaviti ovdje"
              : "Pokušajte promijeniti filtere pretrage"}
          </Typography>
        </Paper>
      )}

      {/* Results Table */}
      {filteredMatches.length > 0 && (
        <Paper>
          {isMobile ? (
            // Mobile card view
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {paginatedMatches.map((assignment) => (
                  <MatchCard key={assignment.id} assignment={assignment} />
                ))}
              </Stack>
            </Box>
          ) : (
            // Desktop table view
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Utakmica</TableCell>
                    <TableCell>Natjecanje</TableCell>
                    <TableCell>Mjesto</TableCell>
                    <TableCell>Uloga</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMatches.map((assignment) => {
                    const match = assignment.match || assignment.Match;
                    const matchDate = match?.matchDate || match?.date;
                    const homeTeam =
                      match?.homeTeam?.name || match?.HomeTeam?.name || "N/A";
                    const awayTeam =
                      match?.awayTeam?.name || match?.AwayTeam?.name || "N/A";
                    const competition =
                      match?.competition?.name ||
                      match?.Competition?.name ||
                      "-";
                    const venue =
                      match?.venue?.name || match?.Venue?.name || "-";

                    return (
                      <TableRow key={assignment.id} hover>
                        <TableCell>
                          {matchDate
                            ? format(parseISO(matchDate), "dd.MM.yyyy", {
                                locale: hr,
                              })
                            : "-"}
                          <Typography
                            variant='caption'
                            display='block'
                            color='text.secondary'
                          >
                            {matchDate
                              ? format(parseISO(matchDate), "HH:mm")
                              : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
                            {homeTeam} - {awayTeam}
                          </Typography>
                        </TableCell>
                        <TableCell>{competition}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LocationIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            {venue}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleName(assignment.role)}
                            size='small'
                            sx={{
                              bgcolor: getRoleColor(assignment.role),
                              color: "white",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component='div'
            count={filteredMatches.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage='Redaka po stranici:'
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} od ${count !== -1 ? count : `više od ${to}`}`
            }
          />
        </Paper>
      )}
    </Box>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ flex: 1 }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}20`, color }}>{icon}</Avatar>
      <Box>
        <Typography variant='h5' fontWeight={600}>
          {value}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Mobile Match Card
const MatchCard = ({ assignment }) => {
  const match = assignment.match || assignment.Match;
  const matchDate = match?.matchDate || match?.date;
  const homeTeam = match?.homeTeam?.name || match?.HomeTeam?.name || "N/A";
  const awayTeam = match?.awayTeam?.name || match?.AwayTeam?.name || "N/A";
  const competition =
    match?.competition?.name || match?.Competition?.name || "";
  const venue = match?.venue?.name || match?.Venue?.name || "";

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant='caption' color='text.secondary'>
          {matchDate
            ? format(parseISO(matchDate), "dd.MM.yyyy HH:mm", { locale: hr })
            : "-"}
        </Typography>
        <Chip
          label={getRoleName(assignment.role)}
          size='small'
          sx={{
            bgcolor: getRoleColor(assignment.role),
            color: "white",
            fontWeight: 500,
            height: 22,
            fontSize: "0.7rem",
          }}
        />
      </Box>
      <Typography variant='subtitle2' fontWeight={600} gutterBottom>
        {homeTeam} - {awayTeam}
      </Typography>
      {competition && (
        <Typography variant='caption' color='text.secondary' display='block'>
          {competition}
        </Typography>
      )}
      {venue && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <LocationIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography variant='caption' color='text.disabled'>
            {venue}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Helper functions
function getRoleName(role) {
  const roles = {
    head_referee: "Glavni sudac",
    first_assistant: "1. pomoćni sudac",
    second_assistant: "2. pomoćni sudac",
    fourth_official: "4. službenik",
    var_referee: "VAR sudac",
    avar_referee: "AVAR sudac",
    delegate: "Delegat",
    observer: "Nadzornik",
  };
  return roles[role] || role;
}

function getRoleColor(role) {
  const colors = {
    head_referee: "#f97316",
    first_assistant: "#22c55e",
    second_assistant: "#3b82f6",
    fourth_official: "#8b5cf6",
    var_referee: "#ef4444",
    avar_referee: "#ec4899",
    delegate: "#06b6d4",
    observer: "#64748b",
  };
  return colors[role] || "#64748b";
}

export default HistoryPage;
