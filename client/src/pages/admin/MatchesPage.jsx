import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  SportsSoccer as MatchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
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

const MatchesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  const { data, isLoading, refetch } = useMatches({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();

  const matches = data?.data || [];
  console.log("Matches data:", matches);
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
    const matchDate = new Date(match.dateTime);
    const isPast = matchDate < new Date();

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
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("bs-BA", {
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
    (m) => m.referees && m.referees.length > 0
  ).length;
  const pendingMatches = matches.filter(
    (m) => !m.referees || m.referees.length === 0
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: "28px", fontWeight: 700, color: "#fff", mb: 0.5 }}
          >
            Matches
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Manage scheduled matches and referee assignments
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => refetch()}
              sx={{
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
                borderRadius: "12px",
                color: "#9ca3af",
                "&:hover": { bgcolor: "#242428", color: "#fff" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Export'>
            <IconButton
              sx={{
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
                borderRadius: "12px",
                color: "#9ca3af",
                "&:hover": { bgcolor: "#242428", color: "#fff" },
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#8b5cf6",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            New Match
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        {[
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
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              p: 2.5,
              bgcolor: "#121214",
              border: "1px solid #242428",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <stat.icon sx={{ fontSize: 24, color: stat.color }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
              >
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

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
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "#8b5cf6" }} />
          </Box>
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
                    const { date, time } = formatDateTime(match.dateTime);
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
                                Round {match.round || 1}
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
                              sx={{ fontSize: 16, color: "#6b7280" }}
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
                            <Tooltip title='View Details'>
                              <IconButton
                                sx={{
                                  color: "#6b7280",
                                  "&:hover": {
                                    bgcolor: "#242428",
                                    color: "#3b82f6",
                                  },
                                }}
                              >
                                <ViewIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Edit'>
                              <IconButton
                                onClick={() => handleOpenModal(match)}
                                sx={{
                                  color: "#6b7280",
                                  "&:hover": {
                                    bgcolor: "#242428",
                                    color: "#8b5cf6",
                                  },
                                }}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Delete'>
                              <IconButton
                                onClick={() => handleDelete(match.id)}
                                sx={{
                                  color: "#6b7280",
                                  "&:hover": {
                                    bgcolor: "#242428",
                                    color: "#ef4444",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
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
