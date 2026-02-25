import { useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import {
  Groups3 as TeamsIcon,
  CheckCircle as ActiveIcon,
  LocationOn as LocationIcon,
  Stadium as StadiumIcon,
  Warning as SuspendedIcon,
} from "@mui/icons-material";
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useTeamStats,
} from "../../hooks/admin";
import { TeamModal } from "../../components/user/TeamModal";
import {
  PageHeader,
  StatsGrid,
  EditButton,
  DeleteButton,
  DataTable,
  ConfirmDialog,
  FilterSearch,
} from "../../components/ui";
import StatusBadge from "../../components/user/StatusBadge";

const TeamsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const {
    data: teamsRecord,
    isLoading,
    refetch,
    isFetching,
  } = useTeams({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const { data: teamStats } = useTeamStats();

  const cities = teamStats?.data?.cities || [];
  const totalTeams = teamStats?.data?.totalTeams || 0;
  const activeTeams = teamStats?.data?.activeTeams || 0;
  const suspendedTeams = teamStats?.data?.suspendedTeams || 0;

  const teams = teamsRecord?.data || [];

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

  const handleOpenDialog = (team) => {
    setTeamToDelete(team);
    setConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleDelete = async () => {
    await deleteTeam.mutateAsync(teamToDelete.id);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Teams'
        subtitle='Manage basketball teams and clubs'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New Team'
      />

      <StatsGrid
        stats={[
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
            color: "#3b82f6",
          },
          {
            label: "Suspended Teams",
            value: suspendedTeams,
            icon: SuspendedIcon,
            color: "#df5f04",
          },
          {
            label: "Active Teams",
            value: activeTeams,
            icon: ActiveIcon,
            color: "#22c55e",
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
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FilterSearch
          placeholder='Search teams...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Table */}
      <DataTable
        columns={[
          {
            id: "name",
            label: "Team",
            render: (_, team) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                  {team.shortName?.toUpperCase() ||
                    team.name?.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 500, color: "#fff" }}
                >
                  {team.name}
                </Typography>
              </Box>
            ),
          },
          {
            id: "city",
            label: "City",
            render: (city) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  {city || "N/A"}
                </Typography>
              </Box>
            ),
          },
          {
            id: "venue",
            label: "Home Venue",
            render: (_, team) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StadiumIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  {team.primaryVenue?.name || "N/A"}
                </Typography>
              </Box>
            ),
          },
          {
            id: "status",
            label: "Status",
            render: (status) => <StatusBadge status={status} />,
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (_, team) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <EditButton onClick={() => handleOpenModal(team)} />
                <DeleteButton onClick={() => handleOpenDialog(team)} />
              </Box>
            ),
          },
        ]}
        data={teams}
        loading={isLoading || isFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalTeams}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No teams found'
      />
      <TeamModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createTeam.isPending || updateTeam.isPending}
        editTeam={editingTeam}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
        title='Delete Team'
        message='Are you sure you want to delete this team?'
        confirmText='Delete'
        loading={deleteTeam.isPending}
      />
    </Box>
  );
};

export default TeamsPage;
