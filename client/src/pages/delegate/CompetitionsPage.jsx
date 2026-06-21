import { useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { EmojiEvents as TrophyIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useCompetitions,
  useCompetitionSummary,
  useCreateCompetition,
  useUpdateCompetition,
  useDeleteCompetition,
} from "../../hooks";
import { ConfirmDialog, CustomButton, FilterSearch } from "../../components/ui";
import { CompetitionModal } from "../../components/user/CompetitionModal";
import { CompetitionCard } from "../../components/delegate/competitions";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "suspended", label: "Suspended" },
];

const CompetitionsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [competitionToDelete, setCompetitionToDelete] = useState(null);

  const { data: competitionsData, isLoading } = useCompetitions({ limit: 100 });
  const { data: summaryData } = useCompetitionSummary();
  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition();
  const competitions = competitionsData?.data || [];
  const summary = summaryData?.data || {};

  const searchValue = search.trim().toLowerCase();
  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch =
      !searchValue || competition.name?.toLowerCase().includes(searchValue);
    const matchesStatus =
      statusFilter === "all" || competition.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleOpenModal = (competition = null) => {
    setEditingCompetition(competition);
    setModalOpen(true);
  };

  const handleCreateCompetition = () => {
    handleOpenModal();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCompetition(null);
  };

  const handleViewMatches = (competition) => {
    navigate(`/delegate/matches?competition=${competition.id}`);
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

  const handleDelete = async () => {
    if (!competitionToDelete?.id) return;

    try {
      await deleteCompetition.mutateAsync(competitionToDelete.id);
    } catch (error) {
      console.error("Error deleting competition:", error);
    } finally {
      setCompetitionToDelete(null);
    }
  };

  const isSavingCompetition =
    createCompetition.isPending || updateCompetition.isPending;

  return (
    <Box sx={{ width: "100%" }}>
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
              Competitions
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Overview of active competitions and leagues
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", sm: "auto" },
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
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrophyIcon sx={{ color: "#f97316", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                  {summary.total ?? competitions.length}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                  competitions
                </Typography>
              </Box>
            </Box>
            <CustomButton
              variant='delegate-primary'
              startIcon={<AddIcon />}
              onClick={handleCreateCompetition}
            >
              New competition
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
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
          }}
        >
          <FilterSearch
            variant='delegate'
            placeholder='Search competitions...'
            value={search}
            onChange={handleSearchChange}
          />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              width: "100%",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#2e2e33",
                borderRadius: "9999px",
              },
            }}
          >
            {STATUS_FILTERS.map(({ value, label }) => {
              const isActive = statusFilter === value;

              return (
                <CustomButton
                  key={value}
                  variant='outline'
                  onClick={() => handleStatusFilterChange(value)}
                  sx={{
                    bgcolor: isActive ? "#f97316" : "#121214",
                    borderColor: isActive ? "#f97316" : "#242428",
                    color: isActive ? "#fff" : "#9ca3af",
                    "&:hover": {
                      bgcolor: isActive ? "#ea580c" : "#1a1a1d",
                    },
                  }}
                >
                  {label}
                </CustomButton>
              );
            })}
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#f97316" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, minmax(320px, 1fr))",
              },
              gap: { xs: 2, md: 3 },
            }}
          >
            {filteredCompetitions.map((competition, index) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                index={index}
                onViewMatches={handleViewMatches}
                onEdit={handleOpenModal}
                onDelete={setCompetitionToDelete}
              />
            ))}
          </Box>
        )}
      </Box>
      <CompetitionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isSavingCompetition}
        editCompetition={editingCompetition}
      />
      <ConfirmDialog
        open={Boolean(competitionToDelete)}
        onClose={() => setCompetitionToDelete(null)}
        onConfirm={handleDelete}
        title='Delete Competition'
        message='Are you sure you want to delete this competition?'
        confirmText='Delete'
        confirmColor='error'
        loading={deleteCompetition.isPending}
      />
    </Box>
  );
};

export default CompetitionsPage;
