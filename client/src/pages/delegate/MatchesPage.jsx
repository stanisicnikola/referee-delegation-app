import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, TablePagination } from "@mui/material";
import {
  useCompetitions,
  useCreateMatch,
  useDeleteMatch,
  useMatches,
  useUpdateMatch,
} from "../../hooks";
import MatchModal from "../../components/ui/MatchModal";
import { ConfirmDialog, PageHeader } from "../../components/ui";
import {
  DelegateMatchesFilters,
  DelegateMatchesTable,
} from "../../components/delegate/matches";
import MatchMobileCard, {
  MatchMobileEmptyState,
  MatchMobileSkeleton,
} from "../../components/matches/MatchMobileCard";
import DelegationStatusBadge from "../../components/delegate/DelegationStatusBadge";
import DelegationActionButton from "../../components/delegate/matches/DelegationActionButton";
import ManagementActions from "../../components/delegate/matches/ManagementActions";

const MatchesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchToDelete, setMatchToDelete] = useState(null);

  useEffect(() => {
    const competitionId = searchParams.get("competition");
    const status = searchParams.get("status");
    setCompetitionFilter(competitionId || "all");
    setStatusFilter(status || "all");
  }, [searchParams]);

  useEffect(() => {
    setPage(0);
  }, [search, competitionFilter, statusFilter]);

  const {
    data: matchesData,
    isLoading,
    isFetching,
  } = useMatches({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    competitionId: competitionFilter !== "all" ? competitionFilter : undefined,
    delegationStatus: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: competitionsData } = useCompetitions({ limit: 100 });
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();

  const matches = matchesData?.data || [];
  const pagination = matchesData?.pagination || {};
  const totalMatches = pagination.total || 0;
  const competitions = useMemo(
    () => competitionsData?.data || competitionsData?.competitions || [],
    [competitionsData],
  );
  const hasFilters =
    Boolean(search) || competitionFilter !== "all" || statusFilter !== "all";
  const tableLoading = isLoading || isFetching;

  const handleOpenMatch = (match) => {
    navigate(`/delegate/delegation/${match.id}`);
  };

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

  const handleDelete = async () => {
    if (!matchToDelete) return;

    try {
      await deleteMatch.mutateAsync(matchToDelete.id);
    } catch (error) {
      console.error("Error deleting match:", error);
    } finally {
      setMatchToDelete(null);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title='Matches'
        subtitle='Manage match schedule'
        onAdd={() => handleOpenModal()}
        addLabel='New match'
        addButtonVariant='delegate-primary'
      />

      <DelegateMatchesFilters
        search={search}
        competitionFilter={competitionFilter}
        statusFilter={statusFilter}
        competitions={competitions}
        onSearchChange={(event) => setSearch(event.target.value)}
        onCompetitionChange={(event) =>
          setCompetitionFilter(event.target.value)
        }
        onStatusChange={(event) => setStatusFilter(event.target.value)}
      />

      <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.5 }}>
        {tableLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <MatchMobileSkeleton key={index} />
          ))
        ) : matches.length === 0 ? (
          <MatchMobileEmptyState hasFilters={hasFilters} />
        ) : (
          matches.map((match) => (
            <MatchMobileCard
              key={match.id}
              match={match}
              onClick={handleOpenMatch}
              status={
                <DelegationStatusBadge
                  status={match.delegationStatus}
                  compact
                />
              }
              primaryAction={
                <DelegationActionButton
                  status={match.delegationStatus}
                  onClick={() => handleOpenMatch(match)}
                />
              }
              actions={
                <ManagementActions
                  match={match}
                  onEdit={handleOpenModal}
                  onDelete={setMatchToDelete}
                />
              }
            />
          ))
        )}

        {!tableLoading && totalMatches > 0 && (
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "14px",
              border: "1px solid #242428",
              overflow: "hidden",
            }}
          >
            <TablePagination
              component='div'
              count={totalMatches}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) =>
                handleRowsPerPageChange(parseInt(event.target.value, 10))
              }
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: "1px solid #242428",
                color: "#6b7280",
                "& .MuiTablePagination-selectIcon": { color: "#6b7280" },
                "& .MuiIconButton-root": { color: "#6b7280" },
                "& .Mui-disabled": { color: "#3f3f46 !important" },
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <DelegateMatchesTable
          matches={matches}
          loading={tableLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalMatches}
          hasFilters={hasFilters}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          onOpenMatch={handleOpenMatch}
          onEditMatch={handleOpenModal}
          onDeleteMatch={setMatchToDelete}
        />
      </Box>

      {modalOpen && (
        <MatchModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={createMatch.isPending || updateMatch.isPending}
          editMatch={editingMatch}
        />
      )}

      <ConfirmDialog
        open={Boolean(matchToDelete)}
        onClose={() => setMatchToDelete(null)}
        onConfirm={handleDelete}
        title='Delete Match'
        message='Are you sure you want to delete this match?'
        confirmText='Delete'
        confirmColor='error'
        loading={deleteMatch.isPending}
      />
    </Box>
  );
};

export default MatchesPage;
