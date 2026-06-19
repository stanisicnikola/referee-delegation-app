import { useState } from "react";
import { Box, Typography, Button, Chip, CircularProgress } from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Groups as GroupsIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useCompetitions,
  useCompetitionSummary,
  useCreateCompetition,
  useUpdateCompetition,
  useDeleteCompetition,
} from "../../hooks";
import { ConfirmDialog, FilterSearch } from "../../components/ui";
import { CompetitionModal } from "../../components/user/CompetitionModal";

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

  // Filter competitions
  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch =
      search === "" || comp.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || comp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return {
          bg: "rgba(34, 197, 94, 0.1)",
          color: "#22c55e",
          border: "rgba(34, 197, 94, 0.3)",
          label: "Active",
        };
      case "upcoming":
        return {
          bg: "rgba(249, 115, 22, 0.1)",
          color: "#f97316",
          border: "rgba(249, 115, 22, 0.3)",
          label: "Upcoming",
        };
      case "completed":
        return {
          bg: "rgba(107, 114, 128, 0.1)",
          color: "#6b7280",
          border: "rgba(107, 114, 128, 0.3)",
          label: "Completed",
        };
      case "suspended":
        return {
          bg: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          border: "rgba(239, 68, 68, 0.3)",
          label: "Suspended",
        };
      default:
        return {
          bg: "#242428",
          color: "#6b7280",
          border: "#3f3f46",
          label: "N/A",
        };
    }
  };

  const getCompetitionGradient = (index) => {
    const gradients = [
      "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    ];
    return gradients[index % gradients.length];
  };

  const getCompetitionProgress = (competition) => {
    if (!competition.startDate || !competition.endDate) return 0;

    const now = new Date();
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 0;
    }
    if (now <= startDate) return 0;
    if (now >= endDate) return 100;

    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return 0;

    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(
      100,
      Math.max(0, Math.round((elapsed / totalDuration) * 100)),
    );
  };

  const formatDateRange = (competition) => {
    if (!competition.startDate || !competition.endDate) {
      return "Period not defined";
    }

    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return "Period not defined";
    }

    return `${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString(
      "en-GB",
    )}`;
  };

  const formatCategory = (category) => {
    switch (category) {
      case "seniors":
        return "Seniors";
      case "juniors":
        return "Juniors";
      case "youth":
        return "Youth";
      default:
        return "N/A";
    }
  };

  const formatGender = (gender) => {
    switch (gender) {
      case "male":
        return "Men";
      case "female":
        return "Women";
      default:
        return "N/A";
    }
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

  const handleDelete = async () => {
    try {
      await deleteCompetition.mutateAsync(competitionToDelete.id);
    } catch (error) {
      console.error("Error deleting competition:", error);
    } finally {
      setCompetitionToDelete(null);
    }
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
                width: { xs: "100%", sm: "auto" },
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
              New competition
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        {/* Filters */}
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
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              ...inputStyles,
              width: "100%",
              maxWidth: { xs: "100%", md: 400 },
            }}
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
            {["all", "active", "upcoming", "completed", "suspended"].map(
              (status) => (
                <Button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: 1,
                    borderRadius: "10px",
                    bgcolor: statusFilter === status ? "#f97316" : "#121214",
                    border: "1px solid",
                    borderColor:
                      statusFilter === status ? "#f97316" : "#242428",
                    color: statusFilter === status ? "#fff" : "#9ca3af",
                    fontSize: "14px",
                    fontWeight: 500,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    "&:hover": {
                      bgcolor: statusFilter === status ? "#ea580c" : "#1a1a1d",
                    },
                  }}
                >
                  {status === "all"
                    ? "All"
                    : status === "active"
                      ? "Active"
                      : status === "upcoming"
                        ? "Upcoming"
                        : status === "completed"
                          ? "Completed"
                          : "Suspended"}
                </Button>
              ),
            )}
          </Box>
        </Box>

        {/* Competitions Grid */}
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
            {filteredCompetitions.map((competition, index) => {
              const status = competition.status;
              const statusStyle = getStatusStyle(status);
              const progress = getCompetitionProgress(competition);
              return (
                <Box
                  key={competition.id}
                  sx={{
                    bgcolor: "#121214",
                    borderRadius: "16px",
                    border: "1px solid #242428",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "#3f3f46",
                    },
                  }}
                >
                  {/* Card Header with gradient */}
                  <Box
                    sx={{
                      minHeight: { xs: 104, sm: 92 },
                      background: getCompetitionGradient(index),
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: { xs: 2, sm: 3 },
                      py: 2,
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        bgcolor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrophyIcon sx={{ color: "#fff", fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: { xs: "16px", sm: "18px" },
                          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {competition.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        {competition.season || "Season 2024/25"}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusStyle.label}
                      size='small'
                      sx={{
                        ml: { xs: 8, sm: "auto" },
                        bgcolor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "12px",
                        height: 24,
                        maxWidth: "calc(100% - 64px)",
                      }}
                    />
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Stats */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, minmax(0, 1fr))",
                          sm: "repeat(2, 1fr)",
                        },
                        gap: { xs: 1, sm: 2 },
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          textAlign: "center",
                          p: { xs: 1, sm: 1.5 },
                          bgcolor: "#0a0a0b",
                          borderRadius: "10px",
                          minWidth: 0,
                        }}
                      >
                        <GroupsIcon
                          sx={{ color: "#6b7280", fontSize: 20, mb: 0.5 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#fff",
                            fontSize: { xs: "13px", sm: "14px" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatCategory(competition.category)}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Category
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: { xs: 1, sm: 1.5 },
                          bgcolor: "#0a0a0b",
                          borderRadius: "10px",
                          minWidth: 0,
                        }}
                      >
                        <CalendarIcon
                          sx={{ color: "#6b7280", fontSize: 20, mb: 0.5 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#fff",
                            fontSize: { xs: "13px", sm: "14px" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatGender(competition.gender)}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Gender
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Season progress
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          {progress}%
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ fontSize: "12px", color: "#6b7280", mb: 1 }}
                      >
                        {formatDateRange(competition)}
                      </Typography>
                      <Box
                        sx={{
                          height: 6,
                          bgcolor: "#242428",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${progress}%`,
                            height: "100%",
                            background: getCompetitionGradient(index),
                            borderRadius: "3px",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Button
                        fullWidth
                        endIcon={<ArrowIcon />}
                        onClick={() =>
                          navigate(
                            `/delegate/matches?competition=${competition.id}`,
                          )
                        }
                        sx={{
                          py: 1.5,
                          borderRadius: "10px",
                          bgcolor: "#242428",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: 500,
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "#2e2e33",
                          },
                        }}
                      >
                        View matches
                      </Button>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1,
                        }}
                      >
                        <Button
                          size='small'
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenModal(competition)}
                          sx={{
                            color: "#9ca3af",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#242428", color: "#fff" },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size='small'
                          startIcon={<DeleteIcon />}
                          onClick={() => setCompetitionToDelete(competition)}
                          sx={{
                            color: "#ef4444",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(239,68,68,0.1)" },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
      <CompetitionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createCompetition.isPending || updateCompetition.isPending}
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
