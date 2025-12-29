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
  Avatar,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Groups as TeamsIcon,
  LocationOn as LocationIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Stadium as StadiumIcon,
} from "@mui/icons-material";
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "../../hooks/admin";

const TeamModal = ({ open, onClose, onSubmit, isLoading, editTeam = null }) => {
  const [formData, setFormData] = useState({
    name: editTeam?.name || "",
    shortName: editTeam?.shortName || "",
    city: editTeam?.city || "",
    logo: editTeam?.logo || "",
    homeVenue: editTeam?.homeVenue || "",
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
    if (formData.name && formData.city) {
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
            {editTeam ? "Edit Team" : "New Team"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={labelStyles}>Team Name *</Typography>
            <TextField
              fullWidth
              placeholder='e.g. KK Bosna'
              value={formData.name}
              onChange={handleChange("name")}
              sx={inputStyles}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Short Name</Typography>
              <TextField
                fullWidth
                placeholder='BOS'
                value={formData.shortName}
                onChange={handleChange("shortName")}
                sx={inputStyles}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>City *</Typography>
              <TextField
                fullWidth
                placeholder='Sarajevo'
                value={formData.city}
                onChange={handleChange("city")}
                sx={inputStyles}
              />
            </Box>
          </Box>
          <Box>
            <Typography sx={labelStyles}>Home Venue</Typography>
            <TextField
              fullWidth
              placeholder='Dvorana Skenderija'
              value={formData.homeVenue}
              onChange={handleChange("homeVenue")}
              sx={inputStyles}
            />
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
            ) : editTeam ? (
              "Update Team"
            ) : (
              "Create Team"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const TeamsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const { data, isLoading, refetch } = useTeams({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const teams = data?.data || [];
  const totalTeams = data?.pagination?.total || 0;

  const handleOpenModal = (team = null) => {
    setEditingTeam(team);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTeam(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTeam) {
        await updateTeam.mutateAsync({ id: editingTeam.id, data: formData });
      } else {
        await createTeam.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      await deleteTeam.mutateAsync(id);
    }
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

  const cities = [...new Set(teams.map((t) => t.city).filter(Boolean))];

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
            Teams
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Manage basketball teams and clubs
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
            New Team
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
            label: "Total Teams",
            value: totalTeams,
            icon: TeamsIcon,
            color: "#8b5cf6",
          },
          {
            label: "Cities",
            value: cities.length,
            icon: LocationIcon,
            color: "#22c55e",
          },
          {
            label: "Active Season",
            value: teams.length,
            icon: StadiumIcon,
            color: "#3b82f6",
          },
          {
            label: "Premier League",
            value: 12,
            icon: TeamsIcon,
            color: "#f59e0b",
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
          placeholder='Search teams...'
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
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: cityFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Cities</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
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
                      Team
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
                      Short Name
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
                      City
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
                      Home Venue
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
                  {teams.map((team) => (
                    <TableRow
                      key={team.id}
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
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "#8b5cf620",
                              color: "#8b5cf6",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            {team.shortName || team.name?.substring(0, 2)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#fff",
                            }}
                          >
                            {team.name}
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
                          {team.shortName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationIcon
                            sx={{ fontSize: 16, color: "#6b7280" }}
                          />
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {team.city || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <StadiumIcon
                            sx={{ fontSize: 16, color: "#6b7280" }}
                          />
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {team.homeVenue || team.venue?.name || "N/A"}
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
                              onClick={() => handleOpenModal(team)}
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
                              onClick={() => handleDelete(team.id)}
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
                  {teams.length === 0 && (
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
                          No teams found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalTeams}
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

      {/* Team Modal */}
      <TeamModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createTeam.isPending || updateTeam.isPending}
        editTeam={editingTeam}
      />
    </Box>
  );
};

export default TeamsPage;
