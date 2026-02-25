import { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as ActiveIcon,
  Warning as SuspendedIcon,
  DoneAll as CompletedIcon,
} from "@mui/icons-material";
import {
  useCompetitions,
  useCreateCompetition,
  useUpdateCompetition,
  useDeleteCompetition,
  useCompetitionSummary,
} from "../../hooks/admin";
import { CompetitionModal } from "../../components/user/CompetitionModal";
import StatusBadge from "../../components/user/StatusBadge";
import {
  ConfirmDialog,
  PageHeader,
  StatsGrid,
  EditButton,
  DeleteButton,
  DataTable,
  FilterSearch,
  FilterSelect,
} from "../../components/ui";

const CompetitionsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState(null);

  const { data, isLoading, refetch, isFetching } = useCompetitions({
    page: page + 1,
    limit: rowsPerPage,
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: summaryData } = useCompetitionSummary();

  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition();

  const competitions = data?.data || [];
  const totalCompetitions = data?.pagination?.total || 0;

  const summary = summaryData?.data || {
    total: 0,
    active: 0,
    completed: 0,
    upcoming: 0,
    suspended: 0,
  };

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

  const handleOpenDialog = (competition) => {
    setCompetitionToDelete(competition);
    setConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setCompetitionToDelete(null);
  };

  const handleDelete = async () => {
    await deleteCompetition.mutateAsync(competitionToDelete.id);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Competitions'
        subtitle='Manage leagues'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New Competition'
      />

      {/* Stats Cards */}
      <StatsGrid
        stats={[
          {
            label: "Total Competitions",
            value: summary.total,
            icon: TrophyIcon,
            color: "#8b5cf6",
          },
          {
            label: "Active",
            value: summary.active,
            icon: ActiveIcon,
            color: "#22c55e",
          },
          {
            label: "Completed",
            value: summary.completed,
            icon: CompletedIcon,
            color: "#f59e0b",
          },
          {
            label: "Upcoming",
            value: summary.upcoming,
            icon: CalendarIcon,
            color: "#3b82f6",
          },
          {
            label: "Suspended",
            value: summary.suspended,
            icon: SuspendedIcon,
            color: "#ef4444",
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
          placeholder='Search competitions...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder='All Status'
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
      </Box>

      {/* Table */}
      <DataTable
        columns={[
          {
            id: "name",
            label: "Competition",
            render: (_, comp) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  <TrophyIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {comp.name}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            id: "season",
            label: "Season",
            render: (season) => (
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {season}
              </Typography>
            ),
          },
          {
            id: "period",
            label: "Period",
            render: (_, comp) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  {new Date(comp.startDate).toLocaleDateString()} -{" "}
                  {new Date(comp.endDate).toLocaleDateString()}
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
            render: (_, comp) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <EditButton onClick={() => handleOpenModal(comp)} />
                <DeleteButton onClick={() => handleOpenDialog(comp)} />
              </Box>
            ),
          },
        ]}
        data={competitions}
        loading={isLoading || isFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalCompetitions}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No competitions found'
      />

      <CompetitionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createCompetition.isPending || updateCompetition.isPending}
        editCompetition={editingCompetition}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
        title='Delete Competition'
        message='Are you sure you want to delete this competition?'
        confirmText='Delete'
        loading={deleteCompetition.isPending}
      />
    </Box>
  );
};

export default CompetitionsPage;
