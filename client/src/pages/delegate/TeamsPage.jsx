import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TablePagination,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  MoreVert as MoreIcon,
  Groups as GroupsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  useMatches,
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "../../hooks";
import TeamDetailsDialog from "../../components/delegate/TeamDetailsDialog";
import TeamMatchesDialog from "../../components/delegate/TeamMatchesDialog";
import { ConfirmDialog, FilterSearch } from "../../components/ui";
import { TeamModal } from "../../components/user/TeamModal";

const TeamsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTeam, setMenuTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const { data: teamsData, isLoading } = useTeams({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
  });
  const { data: matchesData, isLoading: isMatchesLoading } = useMatches({
    limit: 500,
  });
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const teams = teamsData?.data || [];
  const totalTeams = teamsData?.pagination?.total || 0;
  const matches = useMemo(() => matchesData?.data || [], [matchesData?.data]);

  const paginationFooter = (
    <TablePagination
      component='div'
      count={totalTeams}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
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
  );

  const handleMenuOpen = (event, team) => {
    setAnchorEl(event.currentTarget);
    setMenuTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTeam(null);
  };

  const handleOpenDetails = () => {
    if (!menuTeam) return;
    setSelectedTeam(menuTeam);
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleOpenMatches = () => {
    if (!menuTeam) return;
    setSelectedTeam(menuTeam);
    setMatchesOpen(true);
    handleMenuClose();
  };

  const handleCloseDetails = () => setDetailsOpen(false);
  const handleCloseMatches = () => setMatchesOpen(false);

  const handleOpenModal = (team = null) => {
    setEditingTeam(team);
    setModalOpen(true);
    handleMenuClose();
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

  const handleOpenDelete = (team = menuTeam) => {
    if (!team) return;
    setTeamToDelete(team);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await deleteTeam.mutateAsync(teamToDelete.id);
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setTeamToDelete(null);
    }
  };

  const getTeamColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
      "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
      "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    ];
    return colors[index % colors.length];
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#121214",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#f97316" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  const tableCellStyles = {
    borderBottom: "1px solid #242428",
    py: 2,
    px: 2,
  };

  const matchesByTeamId = useMemo(() => {
    return matches.reduce((acc, match) => {
      const homeId = match.homeTeamId;
      const awayId = match.awayTeamId;
      if (homeId) acc[homeId] = [...(acc[homeId] || []), match];
      if (awayId) acc[awayId] = [...(acc[awayId] || []), match];
      return acc;
    }, {});
  }, [matches]);

  const selectedTeamMatches = selectedTeam
    ? (matchesByTeamId[selectedTeam.id] || []).slice().sort((a, b) => {
        return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      })
    : [];
  const getTeamMatchesCount = (teamId) =>
    (matchesByTeamId[teamId] || []).length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "34px", sm: "40px", md: "48px" },
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.05,
              }}
            >
              Teams
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Overview of all teams in competitions
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", md: "auto" },
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                px: 3,
                py: 1.5,
                bgcolor: "#121214",
                borderRadius: "12px",
                border: "1px solid #242428",
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GroupsIcon sx={{ color: "#f97316", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                  {totalTeams}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                  teams
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                width: { xs: "100%", sm: "auto" },
                px: 2.5,
                py: 1.25,
                borderRadius: "12px",
                bgcolor: "#f97316",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#ea580c" },
              }}
            >
              New team
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        {/* Search */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: { xs: 3, md: 4 },
          }}
        >
          <FilterSearch
            placeholder='Search teams...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              ...inputStyles,
              width: "100%",
              maxWidth: { xs: "100%", md: 400 },
            }}
          />
        </Box>

        {/* Mobile team cards */}
        <Box
          sx={{
            display: { xs: "grid", md: "none" },
            gap: 1.5,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#f97316" }} />
            </Box>
          ) : (
            <>
              {teams.map((team, index) => (
              <Box
                key={team.id}
                sx={{
                  bgcolor: "#121214",
                  borderRadius: "14px",
                  border: "1px solid #242428",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  {team.logoUrl ? (
                    <Avatar
                      src={team.logoUrl}
                      sx={{ width: 48, height: 48, borderRadius: "12px" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: getTeamColor(index),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {team.shortName ||
                        team.name?.substring(0, 3).toUpperCase()}
                    </Box>
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {team.name}
                    </Typography>
                    <Typography sx={{ color: "#6b7280", fontSize: "13px" }}>
                      {team.shortName ||
                        team.name?.substring(0, 3).toUpperCase()}
                    </Typography>
                  </Box>

                  <IconButton
                    size='small'
                    onClick={(e) => handleMenuOpen(e, team)}
                    sx={{
                      color: "#6b7280",
                      flexShrink: 0,
                      "&:hover": { bgcolor: "#242428" },
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: "1px solid #242428",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#9ca3af",
                        mb: 0.75,
                        minWidth: 0,
                      }}
                    >
                      <LocationIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {team.city || "N/A"}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#6b7280",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {team.primaryVenue?.name || "N/A"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      textAlign: "center",
                      px: 1.5,
                      py: 0.75,
                      borderRadius: "10px",
                      bgcolor: "#0a0a0b",
                      border: "1px solid #1a1a1d",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: "#fff" }}>
                      {isMatchesLoading ? "..." : getTeamMatchesCount(team.id)}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
                      matches
                    </Typography>
                  </Box>
                </Box>
              </Box>
              ))}
              {totalTeams > 0 && (
                <Box
                  sx={{
                    bgcolor: "#121214",
                    borderRadius: "14px",
                    border: "1px solid #242428",
                    overflow: "hidden",
                  }}
                >
                  {paginationFooter}
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Desktop teams table */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            overflow: "hidden",
            maxWidth: "100%",
            display: { xs: "none", md: "block" },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#f97316" }} />
            </Box>
          ) : (
            <TableContainer
              sx={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": { height: 8 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#2e2e33",
                  borderRadius: "9999px",
                },
              }}
            >
              <Table sx={{ minWidth: 820 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#0a0a0b" }}>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 260,
                      }}
                    >
                      Team
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 96,
                      }}
                    >
                      Short
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 150,
                      }}
                    >
                      City
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 180,
                      }}
                    >
                      Venue
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "center",
                      }}
                    >
                      Matches
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        width: 50,
                      }}
                    ></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team, index) => (
                    <TableRow
                      key={team.id}
                      sx={{
                        transition: "background 0.15s",
                        "&:hover": { bgcolor: "rgba(249, 115, 22, 0.05)" },
                        "&:last-child td": { borderBottom: "none" },
                      }}
                    >
                      <TableCell sx={tableCellStyles}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          {team.logoUrl ? (
                            <Avatar
                              src={team.logoUrl}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                background: getTeamColor(index),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              {team.shortName ||
                                team.name?.substring(0, 3).toUpperCase()}
                            </Box>
                          )}
                          <Typography sx={{ fontWeight: 500, color: "#fff" }}>
                            {team.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography sx={{ color: "#9ca3af", fontWeight: 500 }}>
                          {team.shortName ||
                            team.name?.substring(0, 3).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "#9ca3af",
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 16 }} />
                          <Typography sx={{ fontSize: "14px" }}>
                            {team.city || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                          {team.primaryVenue?.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ ...tableCellStyles, textAlign: "center" }}
                      >
                        <Typography sx={{ fontWeight: 500, color: "#fff" }}>
                          {isMatchesLoading
                            ? "..."
                            : getTeamMatchesCount(team.id)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <IconButton
                          size='small'
                          onClick={(e) => handleMenuOpen(e, team)}
                          sx={{
                            color: "#6b7280",
                            "&:hover": { bgcolor: "#242428" },
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!isLoading && totalTeams > 0 && paginationFooter}
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              bgcolor: "#1a1a1d",
              border: "1px solid #242428",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              minWidth: 160,
            },
          }}
        >
          <MenuItem
            onClick={handleOpenDetails}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            View details
          </MenuItem>
          <MenuItem
            onClick={handleOpenMatches}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            View matches
          </MenuItem>
          <MenuItem
            onClick={() => handleOpenModal(menuTeam)}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            <EditIcon sx={{ fontSize: 16, mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => handleOpenDelete()}
            sx={{
              color: "#ef4444",
              fontSize: "14px",
              "&:hover": { bgcolor: "rgba(239,68,68,0.1)" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16, mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
        <TeamDetailsDialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          team={selectedTeam}
          matchesCount={selectedTeam ? getTeamMatchesCount(selectedTeam.id) : 0}
          isMatchesLoading={isMatchesLoading}
        />

        <TeamMatchesDialog
          open={matchesOpen}
          onClose={handleCloseMatches}
          team={selectedTeam}
          matches={selectedTeamMatches}
          isLoading={isMatchesLoading}
        />

        <TeamModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={createTeam.isPending || updateTeam.isPending}
          editTeam={editingTeam}
        />

        <ConfirmDialog
          open={Boolean(teamToDelete)}
          onClose={() => setTeamToDelete(null)}
          onConfirm={handleDelete}
          title='Delete Team'
          message='Are you sure you want to delete this team?'
          confirmText='Delete'
          confirmColor='error'
          loading={deleteTeam.isPending}
        />
      </Box>
    </Box>
  );
};

export default TeamsPage;
