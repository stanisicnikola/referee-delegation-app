import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  SportsSoccer as MatchIcon,
  CheckCircle as AssignedIcon,
  Warning as PendingIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  useMatches,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
} from "../../hooks/admin";
import MatchModal from "../../components/ui/MatchModal";
import {
  LoadingSpinner,
  PageHeader,
  StatsGrid,
  EditButton,
  DeleteButton,
} from "../../components/ui";

const MatchesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  const { data, isLoading, refetch, isFetching } = useMatches({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();

  const matches = data?.data || [];
  const totalMatches = data?.pagination?.total || 0;

  const handleOpenModal = (match = null) => {
    setEditingMatch(match);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMatch(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingMatch) {
        await updateMatch.mutateAsync({ id: editingMatch.id, data: formData });
      } else {
        await createMatch.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving match:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      await deleteMatch.mutateAsync(id);
    }
  };

  const getStatusBadge = (match) => {
    const hasReferees = match.referees && match.referees.length > 0;
    const matchDateValue = match.scheduledAt;
    const matchDate = matchDateValue ? new Date(matchDateValue) : null;
    const isPast = matchDate ? matchDate < new Date() : false;

    if (isPast) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
            bgcolor: "rgba(107, 114, 128, 0.15)",
            border: "1px solid #6b728030",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}
          >
            Completed
          </Typography>
        </Box>
      );
    }

    if (hasReferees) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
            bgcolor: "rgba(34, 197, 94, 0.15)",
            border: "1px solid #22c55e30",
          }}
        >
          <AssignedIcon sx={{ fontSize: 12, color: "#22c55e" }} />
          <Typography
            sx={{ fontSize: "12px", fontWeight: 500, color: "#22c55e" }}
          >
            Assigned
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.5,
          py: 0.5,
          borderRadius: "20px",
          bgcolor: "rgba(234, 179, 8, 0.15)",
          border: "1px solid #eab30830",
        }}
      >
        <PendingIcon sx={{ fontSize: 12, color: "#eab308" }} />
        <Typography
          sx={{ fontSize: "12px", fontWeight: 500, color: "#eab308" }}
        >
          {match.status}
        </Typography>
      </Box>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return { date: "—", time: "—" };
    }

    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("bs-BA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  const assignedMatches = matches.filter(
    (m) => m.referees && m.referees.length > 0,
  ).length;
  const pendingMatches = matches.filter(
    (m) => !m.referees || m.referees.length === 0,
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <PageHeader
        title='Matches'
        subtitle='Manage scheduled matches and referee assignments'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New Match'
      />

      <StatsGrid
        stats={[
          {
            label: "Total Matches",
            value: totalMatches,
            icon: MatchIcon,
            color: "#8b5cf6",
          },
          {
            label: "Assigned",
            value: assignedMatches,
            icon: AssignedIcon,
            color: "#22c55e",
          },
          {
            label: "Pending Delegation",
            value: pendingMatches,
            icon: PendingIcon,
            color: "#eab308",
          },
          {
            label: "This Week",
            value: 5,
            icon: CalendarIcon,
            color: "#3b82f6",
          },
        ]}
      />

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          placeholder='Search matches, teams...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: "#6b7280" }} />
              </InputAdornment>
            ),
          }}
          sx={{ ...inputStyles, flex: 1, maxWidth: 400 }}
        />

        <FormControl sx={{ minWidth: 180, ...inputStyles }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: statusFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Status</MenuItem>
            <MenuItem value='assigned'>Assigned</MenuItem>
            <MenuItem value='pending'>Pending Delegation</MenuItem>
            <MenuItem value='completed'>Completed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type='date'
          sx={{
            ...inputStyles,
            width: 180,
            "& input::-webkit-calendar-picker-indicator": {
              filter: "invert(1)",
            },
          }}
        />
      </Box>

      {/* Table */}
      <Box
        sx={{
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {isLoading || isFetching ? (
          <LoadingSpinner />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#0a0a0b" }}>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Match
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Competition
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Date & Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Venue
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((match) => {
                    const dateTimeValue = match.scheduledAt;
                    const { date, time } = formatDateTime(dateTimeValue);
                    return (
                      <TableRow
                        key={match.id}
                        sx={{
                          "&:hover": { bgcolor: "#1a1a1d" },
                          "& td": { borderColor: "#242428" },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "#8b5cf615",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <MatchIcon
                                sx={{ fontSize: 20, color: "#8b5cf6" }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#fff",
                                }}
                              >
                                {match.homeTeam?.name || "TBD"} vs{" "}
                                {match.awayTeam?.name || "TBD"}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                Round {match.round}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {match.competition?.name || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <CalendarIcon
                                sx={{ fontSize: 14, color: "#6b7280" }}
                              />
                              <Typography
                                sx={{ fontSize: "14px", color: "#fff" }}
                              >
                                {date}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <TimeIcon
                                sx={{ fontSize: 14, color: "#6b7280" }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  color: "#6b7280",
                                  fontFamily: "monospace",
                                }}
                              >
                                {time}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationIcon
                              sx={{ fontSize: 16, color: "#3b82f6" }}
                            />
                            <Typography
                              sx={{ fontSize: "14px", color: "#9ca3af" }}
                            >
                              {match.venue?.name || "TBD"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusBadge(match)}</TableCell>
                        <TableCell align='right'>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 0.5,
                            }}
                          >
                            <EditButton
                              onClick={() => handleOpenModal(match)}
                            />
                            <DeleteButton
                              onClick={() => handleDelete(match.id)}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {matches.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{
                          textAlign: "center",
                          py: 8,
                          borderColor: "#242428",
                        }}
                      >
                        <Typography sx={{ color: "#6b7280" }}>
                          No matches found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalMatches}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: "1px solid #242428",
                color: "#6b7280",
                "& .MuiTablePagination-selectIcon": { color: "#6b7280" },
                "& .MuiIconButton-root": { color: "#6b7280" },
                "& .Mui-disabled": { color: "#3f3f46 !important" },
              }}
            />
          </>
        )}
      </Box>

      {/* Match Modal */}
      <MatchModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createMatch.isPending || updateMatch.isPending}
        editMatch={editingMatch}
      />
    </Box>
  );
};

export default MatchesPage;
