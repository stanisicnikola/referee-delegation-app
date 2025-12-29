import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  Groups as GroupsIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCompetitions } from "../../hooks";

const CompetitionsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: competitionsData, isLoading } = useCompetitions();
  const competitions = competitionsData?.data || [];

  // Filter competitions
  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch =
      search === "" || comp.name?.toLowerCase().includes(search.toLowerCase());
    // Mock status filter
    return matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return {
          bg: "rgba(34, 197, 94, 0.1)",
          color: "#22c55e",
          border: "rgba(34, 197, 94, 0.3)",
          label: "Aktivno",
        };
      case "upcoming":
        return {
          bg: "rgba(249, 115, 22, 0.1)",
          color: "#f97316",
          border: "rgba(249, 115, 22, 0.3)",
          label: "Uskoro",
        };
      case "completed":
        return {
          bg: "rgba(107, 114, 128, 0.1)",
          color: "#6b7280",
          border: "rgba(107, 114, 128, 0.3)",
          label: "Završeno",
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

  // Mock data for demo
  const getCompetitionStatus = (index) => {
    const statuses = ["active", "active", "upcoming", "completed", "active"];
    return statuses[index % statuses.length];
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
    <Box>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "rgba(10, 10, 11, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #242428",
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
            >
              Takmičenja
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Pregled aktivnih takmičenja i liga
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrophyIcon sx={{ color: "#f97316", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                  {competitions.length}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                  takmičenja
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            placeholder='Pretraži takmičenja...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size='small'
            sx={{ ...inputStyles, width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            {["all", "active", "upcoming", "completed"].map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  bgcolor: statusFilter === status ? "#f97316" : "#121214",
                  border: "1px solid",
                  borderColor: statusFilter === status ? "#f97316" : "#242428",
                  color: statusFilter === status ? "#fff" : "#9ca3af",
                  fontSize: "14px",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: statusFilter === status ? "#ea580c" : "#1a1a1d",
                  },
                }}
              >
                {status === "all"
                  ? "Sva"
                  : status === "active"
                  ? "Aktivna"
                  : status === "upcoming"
                  ? "Uskoro"
                  : "Završena"}
              </Button>
            ))}
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
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: 3,
            }}
          >
            {filteredCompetitions.map((competition, index) => {
              const status = getCompetitionStatus(index);
              const statusStyle = getStatusStyle(status);
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
                      height: 80,
                      background: getCompetitionGradient(index),
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      px: 3,
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
                    <Box sx={{ ml: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "18px",
                          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
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
                        {competition.season || "Sezona 2024/25"}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusStyle.label}
                      size='small'
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "12px",
                        height: 24,
                      }}
                    />
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: 3 }}>
                    {/* Stats */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1.5,
                          bgcolor: "#0a0a0b",
                          borderRadius: "10px",
                        }}
                      >
                        <GroupsIcon
                          sx={{ color: "#6b7280", fontSize: 20, mb: 0.5 }}
                        />
                        <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                          {competition.teamsCount ||
                            Math.floor(Math.random() * 12) + 8}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Timova
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1.5,
                          bgcolor: "#0a0a0b",
                          borderRadius: "10px",
                        }}
                      >
                        <CalendarIcon
                          sx={{ color: "#6b7280", fontSize: 20, mb: 0.5 }}
                        />
                        <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                          {competition.matchesCount ||
                            Math.floor(Math.random() * 50) + 20}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Utakmica
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1.5,
                          bgcolor: "#0a0a0b",
                          borderRadius: "10px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#f97316",
                            fontSize: "20px",
                          }}
                        >
                          {competition.currentRound ||
                            Math.floor(Math.random() * 20) + 1}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Trenutno kolo
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
                          Napredak sezone
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          {competition.progress ||
                            Math.floor(Math.random() * 60) + 20}
                          %
                        </Typography>
                      </Box>
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
                            width: `${
                              competition.progress ||
                              Math.floor(Math.random() * 60) + 20
                            }%`,
                            height: "100%",
                            background: getCompetitionGradient(index),
                            borderRadius: "3px",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Button
                      fullWidth
                      endIcon={<ArrowIcon />}
                      onClick={() =>
                        navigate(
                          `/delegate/matches?competition=${competition.id}`
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
                      Pregledaj utakmice
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CompetitionsPage;
