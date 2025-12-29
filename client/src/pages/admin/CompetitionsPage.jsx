import { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  SportsSoccer as MatchIcon,
} from "@mui/icons-material";
import {
  useCompetitions,
  useCreateCompetition,
  useUpdateCompetition,
  useDeleteCompetition,
} from "../../hooks/admin";

const CompetitionModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editCompetition = null,
}) => {
  const [formData, setFormData] = useState({
    name: editCompetition?.name || "",
    season: editCompetition?.season || "",
    type: editCompetition?.type || "league",
    startDate: editCompetition?.startDate
      ? new Date(editCompetition.startDate).toISOString().split("T")[0]
      : "",
    endDate: editCompetition?.endDate
      ? new Date(editCompetition.endDate).toISOString().split("T")[0]
      : "",
  });
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.season) {
      onSubmit(formData);
    }
  };

  if (!open) return null;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      py: 1.5,
      px: 2,
    },
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          bgcolor: "#121214",
          borderRadius: "16px",
          border: "1px solid #242428",
          width: "100%",
          maxWidth: 500,
          mx: 2,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            {editCompetition ? "Edit Competition" : "New Competition"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={labelStyles}>Competition Name *</Typography>
            <TextField
              fullWidth
              placeholder='e.g. Premijer liga BiH'
              value={formData.name}
              onChange={handleChange("name")}
              sx={inputStyles}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Season *</Typography>
              <TextField
                fullWidth
                placeholder='2024/2025'
                value={formData.season}
                onChange={handleChange("season")}
                sx={inputStyles}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Type</Typography>
              <FormControl fullWidth sx={inputStyles}>
                <Select
                  value={formData.type}
                  onChange={handleChange("type")}
                  sx={{ "& .MuiSelect-select": { color: "#fff" } }}
                >
                  <MenuItem value='league'>League</MenuItem>
                  <MenuItem value='cup'>Cup</MenuItem>
                  <MenuItem value='playoff'>Playoff</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Start Date</Typography>
              <TextField
                fullWidth
                type='date'
                value={formData.startDate}
                onChange={handleChange("startDate")}
                sx={{
                  ...inputStyles,
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)",
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>End Date</Typography>
              <TextField
                fullWidth
                type='date'
                value={formData.endDate}
                onChange={handleChange("endDate")}
                sx={{
                  ...inputStyles,
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              color: "#fff",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : editCompetition ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const CompetitionsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);

  const { data, isLoading, refetch } = useCompetitions({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition();

  const competitions = data?.data || [];
  const totalCompetitions = data?.pagination?.total || 0;

  const handleOpenModal = (competition = null) => {
    setEditingCompetition(competition);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCompetition(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCompetition) {
        await updateCompetition.mutateAsync({
          id: editingCompetition.id,
          data: formData,
        });
      } else {
        await createCompetition.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving competition:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      await deleteCompetition.mutateAsync(id);
    }
  };

  const getTypeBadge = (type) => {
    const config = {
      league: {
        label: "League",
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.15)",
      },
      cup: { label: "Cup", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
      playoff: {
        label: "Playoff",
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.15)",
      },
    };
    const { label, color, bg } = config[type] || config.league;
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.5,
          py: 0.5,
          borderRadius: "20px",
          bgcolor: bg,
          border: `1px solid ${color}30`,
        }}
      >
        <Typography sx={{ fontSize: "12px", fontWeight: 500, color }}>
          {label}
        </Typography>
      </Box>
    );
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
            Competitions
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Manage leagues, cups and tournaments
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
            New Competition
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
            label: "Total Competitions",
            value: totalCompetitions,
            icon: TrophyIcon,
            color: "#8b5cf6",
          },
          {
            label: "Leagues",
            value: competitions.filter((c) => c.type === "league").length,
            icon: TrophyIcon,
            color: "#22c55e",
          },
          {
            label: "Cups",
            value: competitions.filter((c) => c.type === "cup").length,
            icon: TrophyIcon,
            color: "#f59e0b",
          },
          {
            label: "Active",
            value: competitions.length,
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
          placeholder='Search competitions...'
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
        <FormControl sx={{ minWidth: 150, ...inputStyles }}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: typeFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Types</MenuItem>
            <MenuItem value='league'>League</MenuItem>
            <MenuItem value='cup'>Cup</MenuItem>
            <MenuItem value='playoff'>Playoff</MenuItem>
          </Select>
        </FormControl>
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
                      Season
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
                      Type
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
                      Period
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
                  {competitions.map((comp) => (
                    <TableRow
                      key={comp.id}
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
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "10px",
                              bgcolor: "#f59e0b15",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <TrophyIcon
                              sx={{ fontSize: 20, color: "#f59e0b" }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#fff",
                            }}
                          >
                            {comp.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            color: "#9ca3af",
                            fontFamily: "monospace",
                          }}
                        >
                          {comp.season}
                        </Typography>
                      </TableCell>
                      <TableCell>{getTypeBadge(comp.type)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarIcon
                            sx={{ fontSize: 16, color: "#6b7280" }}
                          />
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {comp.startDate
                              ? new Date(comp.startDate).toLocaleDateString(
                                  "bs-BA"
                                )
                              : "N/A"}{" "}
                            -{" "}
                            {comp.endDate
                              ? new Date(comp.endDate).toLocaleDateString(
                                  "bs-BA"
                                )
                              : "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title='View'>
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
                              onClick={() => handleOpenModal(comp)}
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
                              onClick={() => handleDelete(comp.id)}
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
                  ))}
                  {competitions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        sx={{
                          textAlign: "center",
                          py: 8,
                          borderColor: "#242428",
                        }}
                      >
                        <Typography sx={{ color: "#6b7280" }}>
                          No competitions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalCompetitions}
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

      <CompetitionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createCompetition.isPending || updateCompetition.isPending}
        editCompetition={editingCompetition}
      />
    </Box>
  );
};

export default CompetitionsPage;
