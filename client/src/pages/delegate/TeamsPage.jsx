import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  TablePagination,
  Typography,
} from "@mui/material";
import {
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
  useTeamStats,
} from "../../hooks";
import TeamDetailsDialog from "../../components/delegate/TeamDetailsDialog";
import TeamMatchesDialog from "../../components/delegate/TeamMatchesDialog";
import { ConfirmDialog, CustomButton, FilterSearch } from "../../components/ui";
import { TeamModal } from "../../components/user/TeamModal";
import {
  DelegateTeamsTable,
  TeamMobileCard,
} from "../../components/delegate/teams";

const DELEGATE_ACCENT = "#f97316";

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
  const { data: teamStatsData } = useTeamStats();
  const { data: matchesData, isLoading: isMatchesLoading } = useMatches({
    limit: 500,
  });
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const teams = teamsData?.data || [];
  const totalTeams = teamsData?.pagination?.total || 0;
  const teamCount = teamStatsData?.data?.totalTeams || totalTeams;
  const matches = useMemo(() => matchesData?.data || [], [matchesData?.data]);
  const isSavingTeam = createTeam.isPending || updateTeam.isPending;

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

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

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
    if (!teamToDelete?.id) return;

    try {
      await deleteTeam.mutateAsync(teamToDelete.id);
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setTeamToDelete(null);
    }
  };

  const paginationFooter = (
    <TablePagination
      component='div'
      count={totalTeams}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(event) => {
        handleRowsPerPageChange(parseInt(event.target.value, 10));
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

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
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
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GroupsIcon sx={{ color: DELEGATE_ACCENT, fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                  {teamCount}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                  teams
                </Typography>
              </Box>
            </Box>
            <CustomButton
              variant='delegate-primary'
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              New team
            </CustomButton>
          </Box>
        </Box>
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: { xs: 3, md: 4 },
          }}
        >
          <FilterSearch
            variant='delegate'
            placeholder='Search teams...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Box>

        <Box
          sx={{
            display: { xs: "grid", md: "none" },
            gap: 1.5,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: DELEGATE_ACCENT }} />
            </Box>
          ) : (
            <>
              {teams.map((team) => (
                <TeamMobileCard
                  key={team.id}
                  team={team}
                  matchesCount={getTeamMatchesCount(team.id)}
                  isMatchesLoading={isMatchesLoading}
                  onMenuOpen={handleMenuOpen}
                />
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

        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <DelegateTeamsTable
            teams={teams}
            loading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRows={totalTeams}
            isMatchesLoading={isMatchesLoading}
            getTeamMatchesCount={getTeamMatchesCount}
            onPageChange={setPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            onMenuOpen={handleMenuOpen}
          />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                minWidth: 160,
              },
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
          onClose={() => setDetailsOpen(false)}
          team={selectedTeam}
          matchesCount={selectedTeam ? getTeamMatchesCount(selectedTeam.id) : 0}
          isMatchesLoading={isMatchesLoading}
        />

        <TeamMatchesDialog
          open={matchesOpen}
          onClose={() => setMatchesOpen(false)}
          team={selectedTeam}
          matches={selectedTeamMatches}
          isLoading={isMatchesLoading}
        />

        <TeamModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isSavingTeam}
          editTeam={editingTeam}
          panelVariant='delegate'
          accentColor={DELEGATE_ACCENT}
          primaryButtonVariant='delegate-primary'
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
