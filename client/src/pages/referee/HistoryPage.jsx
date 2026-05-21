import { useMemo, useState } from "react";
import { Alert, Box, Chip, Typography } from "@mui/material";
import {
  useCompetitions,
  useMyHistory,
  useMyHistoryStatistics,
} from "../../hooks";
import { DataTable, FilterSearch, FilterSelect } from "../../components/ui";
import { getRefereeRoleBadge } from "../../utils/refereeAssignmentBadges";

const COMPETITIONS_QUERY = { limit: 1000 };

const ROLE_OPTIONS = [
  { value: "first_referee", label: "1st Referee" },
  { value: "second_referee", label: "2nd Referee" },
  { value: "third_referee", label: "3rd Referee" },
];

const COLORS = {
  card: "#121214",
  panel: "#1a1a1d",
  border: "#242428",
  text: "#f8fafc",
  muted: "#6b7280",
  mutedStrong: "#9ca3af",
  orange: "#f97316",
  purple: "#c084fc",
  blue: "#60a5fa",
  green: "#22c55e",
};

const getMatch = (assignment) => assignment?.match || assignment?.Match || null;

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
    (side === "home" ? "Home Team" : "Away Team")
  );
};

const getCompetition = (match) =>
  match?.competition || match?.Competition || null;

const getCompetitionId = (match) =>
  match?.competitionId || match?.competition_id || getCompetition(match)?.id;

const getCompetitionName = (match) =>
  getCompetition(match)?.name || "Competition";

const getVenueText = (match) => {
  const venue = match?.venue || match?.Venue;
  if (!venue) return "";

  return [venue.name, venue.city].filter(Boolean).join(", ");
};

const getScoreValue = (match, camelKey, snakeKey) =>
  match?.[camelKey] ?? match?.[snakeKey] ?? null;

const getResultText = (match) => {
  const homeScore = getScoreValue(match, "homeScore", "home_score");
  const awayScore = getScoreValue(match, "awayScore", "away_score");

  if (homeScore === null || awayScore === null) return "-";
  return `${homeScore} : ${awayScore}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
};

const toHistoryRow = (assignment, index) => {
  const match = getMatch(assignment);
  const scheduledDate = getScheduledDate(match);
  const role = getRefereeRoleBadge(assignment.role);

  return {
    id: assignment.id || assignment.matchId || match?.id || `history-${index}`,
    date: scheduledDate,
    dateLabel: formatDate(scheduledDate),
    matchLabel: `${getTeamName(match, "home")} vs ${getTeamName(
      match,
      "away",
    )}`,
    competitionId: getCompetitionId(match),
    competitionLabel: getCompetitionName(match),
    venueLabel: getVenueText(match),
    roleKey: assignment.role,
    role,
    resultLabel: getResultText(match),
  };
};

const HistoryPage = () => {
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: historyData,
    isLoading: historyLoading,
    isFetching: historyFetching,
    error: historyError,
  } = useMyHistory({
    page: page + 1,
    limit: rowsPerPage,
    search: search.trim() || undefined,
    competitionId:
      competitionFilter !== "all" ? competitionFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });
  const { data: historyStatisticsData, isLoading: historyStatisticsLoading } =
    useMyHistoryStatistics();
  const { data: competitionsData } = useCompetitions(COMPETITIONS_QUERY);

  const historyRows = useMemo(
    () => (historyData?.data || []).map(toHistoryRow),
    [historyData?.data],
  );

  const stats = historyStatisticsData?.data || {
    total: 0,
    first: 0,
    second: 0,
    third: 0,
  };

  const competitionOptions = useMemo(() => {
    const options = new Map();

    (competitionsData?.data || []).forEach((competition) => {
      if (competition?.id) {
        options.set(String(competition.id), {
          value: competition.id,
          label: competition.name,
        });
      }
    });

    return Array.from(options.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [competitionsData?.data]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleCompetitionChange = (event) => {
    setCompetitionFilter(event.target.value);
    setPage(0);
  };

  const handleRoleChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          mb: { xs: 2.5, md: 3.5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "flex-end" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: COLORS.text,
              fontSize: { xs: "34px", sm: "40px", md: "48px" },
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            History
          </Typography>
          <Typography sx={{ color: COLORS.muted, fontSize: "14px", mt: 0.75 }}>
            Completed matches you officiated
          </Typography>
        </Box>
      </Box>

      <HistoryStats stats={stats} loading={historyStatisticsLoading} />

      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "16px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: { sm: "wrap" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <FilterSearch
          variant='referee'
          placeholder='Search matches...'
          value={search}
          onChange={handleSearchChange}
        />

        <FilterSelect
          variant='referee'
          value={competitionFilter}
          onChange={handleCompetitionChange}
          placeholder='All Competitions'
          minWidth={240}
          options={competitionOptions}
        />

        <FilterSelect
          variant='referee'
          value={roleFilter}
          onChange={handleRoleChange}
          placeholder='All Roles'
          minWidth={180}
          options={ROLE_OPTIONS}
        />
      </Box>

      {historyError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Failed to load match history: {historyError.message}
        </Alert>
      )}

      <DataTable
        columns={[
          {
            id: "dateLabel",
            label: "Date",
            width: 150,
            render: (value) => (
              <Typography
                sx={{
                  color: COLORS.text,
                  fontWeight: 700,
                  fontSize: "15px",
                  letterSpacing: 0,
                }}
              >
                {value}
              </Typography>
            ),
          },
          {
            id: "matchLabel",
            label: "Match",
            minWidth: 280,
            render: (value) => (
              <Typography
                sx={{ color: COLORS.text, fontWeight: 700, fontSize: "15px" }}
              >
                {value}
              </Typography>
            ),
          },
          {
            id: "competitionLabel",
            label: "Competition",
            width: 190,
            render: (value) => (
              <Chip
                label={value}
                size='small'
                sx={{
                  height: 26,
                  borderRadius: "7px",
                  bgcolor: "rgba(249, 115, 22, 0.13)",
                  color: COLORS.orange,
                  fontWeight: 800,
                  fontSize: "12px",
                }}
              />
            ),
          },
          {
            id: "role",
            label: "Role",
            width: 160,
            render: (_, row) => (
              <Chip
                label={row.role.label}
                size='small'
                sx={{
                  height: 26,
                  borderRadius: "7px",
                  bgcolor: row.role.bg,
                  color: row.role.color,
                  fontWeight: 800,
                  fontSize: "12px",
                }}
              />
            ),
          },
          {
            id: "resultLabel",
            label: "Result",
            width: 150,
            render: (value) => (
              <Typography
                sx={{
                  color: COLORS.text,
                  fontWeight: 800,
                  fontSize: "16px",
                  letterSpacing: 0,
                }}
              >
                {value}
              </Typography>
            ),
          },
        ]}
        data={historyRows}
        loading={historyLoading || historyFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={historyData?.pagination?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No match history found'
      />
    </Box>
  );
};

const HistoryStats = ({ stats }) => {
  const items = [
    { label: "Total", value: stats.total, color: COLORS.text },
    { label: "1st Referee", value: stats.first, color: COLORS.purple },
    { label: "2nd Referee", value: stats.second, color: COLORS.blue },
    { label: "3rd Referee", value: stats.third, color: COLORS.green },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: { xs: 1.5, md: 2 },
        mb: { xs: 3, md: 4 },
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            minHeight: { xs: 120, md: 138 },
            p: { xs: 2.5, md: 3 },
            bgcolor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: item.color,
              fontSize: { xs: "38px", md: "46px" },
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {item.value}
          </Typography>
          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: { xs: "15px", md: "16px" },
              fontWeight: 800,
              mt: 1.25,
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default HistoryPage;
