import { useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Alert, Box, Chip, Typography } from "@mui/material";
import {
  useCompetitions,
  useMyHistory,
  useMyHistoryStatistics,
} from "../../hooks";
import {
  DataTable,
  FilterSearch,
  FilterSelect,
  PageHeader,
  RefereeRoleBadge,
  StatsGrid,
} from "../../components/ui";
import { REFEREE_ROLE_OPTIONS } from "../../utils/refereeAssignmentBadges";

const COMPETITIONS_QUERY = { limit: 1000 };

const HistoryPage = () => {
  const theme = useTheme();
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
    competitionId: competitionFilter !== "all" ? competitionFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });
  const { data: historyStatisticsData, isLoading: historyStatisticsLoading } =
    useMyHistoryStatistics();
  const { data: competitionsData } = useCompetitions(COMPETITIONS_QUERY);

  const historyRows = historyData?.data || [];
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
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader title='History' subtitle='Completed matches you officiated' />

      <StatsGrid
        columns={4}
        loading={historyStatisticsLoading}
        centered
        cardSx={{ minHeight: { xs: 120, md: 138 } }}
        valueSx={{
          fontSize: { xs: "38px", md: "46px" },
          fontWeight: 900,
        }}
        labelSx={{
          fontSize: { xs: "15px", md: "16px" },
          fontWeight: 800,
          mt: 0.5,
        }}
        stats={[
          {
            label: "Total",
            value: stats.total,
            color: theme.palette.text.primary,
          },
          {
            label: "1st Referee",
            value: stats.first,
            color: theme.palette.refereeRoleColors.first,
          },
          {
            label: "2nd Referee",
            value: stats.second,
            color: theme.palette.refereeRoleColors.second,
          },
          {
            label: "3rd Referee",
            value: stats.third,
            color: theme.palette.refereeRoleColors.third,
          },
        ]}
      />

      <Box
        sx={(theme) => ({
          p: 2,
          mb: 3,
          bgcolor: "background.paper",
          border: `1px solid ${theme.palette.grey[600]}`,
          borderRadius: "16px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: { sm: "wrap" },
          alignItems: "center",
          gap: 2,
        })}
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
          options={REFEREE_ROLE_OPTIONS}
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
                  color: "text.primary",
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
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
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
                sx={(theme) => ({
                  height: 26,
                  borderRadius: "7px",
                  bgcolor: alpha(theme.palette.warning.main, 0.16),
                  color: "warning.main",
                  fontWeight: 800,
                  fontSize: "12px",
                })}
              />
            ),
          },
          {
            id: "roleLabel",
            label: "Role",
            width: 160,
            render: (_, row) => <RefereeRoleBadge role={row.roleKey} />,
          },
          {
            id: "resultLabel",
            label: "Result",
            width: 150,
            render: (value) => (
              <Typography
                sx={{
                  color: "text.primary",
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

export default HistoryPage;
