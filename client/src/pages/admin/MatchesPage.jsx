import { useState } from "react";
import { Box, Chip, Typography } from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  SportsBasketball as MatchIcon,
  CheckCircle as AssignedIcon,
  PendingActions as PendingIcon,
  DoneAll as CompletedIcon,
  Cancel as CancelIcon,
  MoreTime as PostponeIcon,
} from "@mui/icons-material";
import {
  useMatches,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
  useMatchStatistics,
} from "../../hooks/admin";
import MatchModal from "../../components/ui/MatchModal";
import {
  PageHeader,
  StatsGrid,
  EditButton,
  DeleteButton,
  FilterSearch,
  FilterSelect,
  DataTable,
  ConfirmDialog,
} from "../../components/ui";
import MatchStatusBadge from "../../components/user/MatchStatusBadge";

const MatchesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchToDelete, setMatchToDelete] = useState(null);

  const { data, isLoading, refetch, isFetching } = useMatches({
    page: page + 1,
    limit: rowsPerPage,
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const { data: statistics } = useMatchStatistics();
  console.log(">>>>>>>", statistics);

  const matches = data?.data || [];
  const totalMatches = statistics?.data?.total || 0;
  const scheduledMatches = statistics?.data?.scheduled || 0;
  const inProgressMatches = statistics?.data?.inProgress || 0;
  const completedMatches = statistics?.data?.completed || 0;
  const cancelledMatches = statistics?.data?.cancelled || 0;
  const postponedMatches = statistics?.data?.postponed || 0;
  const pendingDelegations = statistics?.data?.pendingDelegations || 0;

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

  const handleOpenDialog = (match) => {
    setMatchToDelete(match);
    setConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setMatchToDelete(null);
  };

  const handleDelete = async () => {
    await deleteMatch.mutateAsync(matchToDelete.id);
    handleCloseDialog();
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return { date: "—", time: "—" };
    }

    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const assignedMatches = matches.filter(
    (m) => m.referees && m.referees.length > 0,
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
            label: "Scheduled",
            value: scheduledMatches,
            icon: CalendarIcon,
            color: "#3b82f6",
          },
          {
            label: "In Progress",
            value: inProgressMatches,
            icon: AssignedIcon,
            color: "#22c55e",
          },
          {
            label: "Completed",
            value: completedMatches,
            icon: CompletedIcon,
            color: "#f59e0b",
          },
          {
            label: "Postponed",
            value: postponedMatches,
            icon: PostponeIcon,
            color: "#d3f127",
          },
          {
            label: "Cancelled",
            value: cancelledMatches,
            icon: CancelIcon,
            color: "#ef4444",
          },
          {
            label: "Pending Delegation",
            value: pendingDelegations,
            icon: PendingIcon,
            color: "#9ecfd2",
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
          placeholder='Search matches...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder='All Status'
          options={[
            { value: "scheduled", label: "Scheduled" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "postponed", label: "Postponed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </Box>

      {/* Table */}
      <DataTable
        columns={[
          {
            id: "id",
            label: "Matches",
            render: (_, match) => (
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
                  <MatchIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {match.homeTeam.name} - {match.awayTeam.name}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            id: "competition",
            label: "Competition",
            render: (_, match) => (
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {match.competition.name}
              </Typography>
            ),
          },
          {
            id: "round",
            label: "Round",
            render: (_, match) => (
              <Chip
                label={match.round}
                size='small'
                sx={{
                  height: 22,
                  minWidth: 28,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  bgcolor: "rgba(107, 114, 128, 0.3)",
                  color: "text.secondary",
                }}
              />
            ),
          },
          {
            id: "scheduledAt",
            label: "Date & Time",
            render: (_, match) => {
              const dateTimeValue = match.scheduledAt;
              const { date, time } = formatDateTime(dateTimeValue);

              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                    {date} - {time}
                  </Typography>
                </Box>
              );
            },
          },
          {
            id: "status",
            label: "Status",
            render: (status, match) => (
              <MatchStatusBadge
                status={status}
                scheduledAt={match.scheduledAt}
              />
            ),
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (_, match) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <EditButton onClick={() => handleOpenModal(match)} />
                <DeleteButton onClick={() => handleOpenDialog(match)} />
              </Box>
            ),
          },
        ]}
        data={matches}
        loading={isLoading || isFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalMatches}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No matches found'
      />

      {/* Match Modal */}
      <MatchModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createMatch.isPending || updateMatch.isPending}
        editMatch={editingMatch}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
        title='Delete Match'
        message='Are you sure you want to delete this match?'
        confirmText='Delete'
        loading={deleteMatch.isPending}
      />
    </Box>
  );
};

export default MatchesPage;
