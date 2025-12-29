import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useMatches, useCompetitions } from "../../hooks";

const MatchesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: matchesData, isLoading } = useMatches({ limit: 100 });
  const { data: competitionsData } = useCompetitions({ limit: 100 });

  const allMatches = matchesData?.data || [];
  const competitions =
    competitionsData?.data || competitionsData?.competitions || [];

  // Filter matches
  const matches = allMatches.filter((match) => {
    const matchesSearch =
      search === "" ||
      match.homeTeam?.name?.toLowerCase().includes(search.toLowerCase()) ||
      match.awayTeam?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesCompetition =
      competitionFilter === "all" || match.competitionId === competitionFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        (!match.delegationStatus || match.delegationStatus === "pending")) ||
      (statusFilter === "delegated" &&
        match.delegationStatus === "delegated") ||
      (statusFilter === "confirmed" && match.delegationStatus === "confirmed");

    return matchesSearch && matchesCompetition && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("bs-BA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("bs-BA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadge = (match) => {
    if (match.delegationStatus === "confirmed") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "12px",
            fontWeight: 500,
            color: "#22c55e",
            bgcolor: "rgba(34, 197, 94, 0.1)",
            px: 1.25,
            py: 0.5,
            borderRadius: "9999px",
          }}
        >
          <CheckIcon sx={{ fontSize: 12 }} />
          Delegirano
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "12px",
          fontWeight: 500,
          color: "#eab308",
          bgcolor: "rgba(234, 179, 8, 0.1)",
          px: 1.25,
          py: 0.5,
          borderRadius: "9999px",
        }}
      >
        <Box
          sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#eab308" }}
        />
        Čeka delegiranje
      </Box>
    );
  };

  const getCompetitionBadge = (competition) => {
    const colors = {
      "Premijer Liga": { color: "#f97316", bg: "rgba(249, 115, 22, 0.1)" },
      "Prva Liga": { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
      Kup: { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
    };
    const style = colors[competition?.name] || {
      color: "#6b7280",
      bg: "rgba(107, 114, 128, 0.1)",
    };

    return (
      <Box
        sx={{
          fontSize: "12px",
          fontWeight: 500,
          color: style.color,
          bgcolor: style.bg,
          px: 1,
          py: 0.5,
          borderRadius: "4px",
        }}
      >
        {competition?.name || "N/A"}
      </Box>
    );
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
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
              Utakmice
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Upravljanje rasporedom utakmica
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            sx={{
              px: 2.5,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#f97316",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            Nova utakmica
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Filters */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <TextField
            placeholder='Pretraži utakmice...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{ ...inputStyles, flex: 1 }}
          />

          <FormControl sx={{ minWidth: 180, ...inputStyles }}>
            <Select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              displayEmpty
              sx={{
                "& .MuiSelect-select": {
                  color: competitionFilter === "all" ? "#6b7280" : "#fff",
                },
              }}
            >
              <MenuItem value='all'>Sva takmičenja</MenuItem>
              {competitions.map((comp) => (
                <MenuItem key={comp.id} value={comp.id}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180, ...inputStyles }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{
                "& .MuiSelect-select": {
                  color: statusFilter === "all" ? "#6b7280" : "#fff",
                },
              }}
            >
              <MenuItem value='all'>Svi statusi</MenuItem>
              <MenuItem value='pending'>Čeka delegiranje</MenuItem>
              <MenuItem value='delegated'>Delegirano</MenuItem>
              <MenuItem value='confirmed'>Potvrđeno</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 8, display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: "#f97316" }} />
            </Box>
          ) : (
            <Box
              component='table'
              sx={{ width: "100%", borderCollapse: "collapse" }}
            >
              <Box component='thead'>
                <Box component='tr' sx={{ borderBottom: "1px solid #242428" }}>
                  {[
                    "Datum",
                    "Utakmica",
                    "Takmičenje",
                    "Lokacija",
                    "Status",
                    "Akcije",
                  ].map((header, i) => (
                    <Box
                      key={header}
                      component='th'
                      sx={{
                        textAlign: i === 5 ? "right" : "left",
                        px: 3,
                        py: 2,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {header}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component='tbody'>
                {matches.length === 0 ? (
                  <Box component='tr'>
                    <Box
                      component='td'
                      colSpan={6}
                      sx={{ textAlign: "center", py: 8, color: "#6b7280" }}
                    >
                      Nema utakmica
                    </Box>
                  </Box>
                ) : (
                  matches.map((match) => {
                    const dateInfo = formatDate(match.dateTime);
                    return (
                      <Box
                        key={match.id}
                        component='tr'
                        sx={{
                          borderBottom: "1px solid #242428",
                          transition: "background 0.15s",
                          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.02)" },
                        }}
                      >
                        <Box component='td' sx={{ px: 3, py: 2 }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontFamily: "monospace",
                              color: "#fff",
                            }}
                          >
                            {dateInfo.date}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "12px", color: "#6b7280" }}
                          >
                            {dateInfo.time}
                          </Typography>
                        </Box>
                        <Box component='td' sx={{ px: 3, py: 2 }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#fff",
                            }}
                          >
                            {match.homeTeam?.name || "TBA"} vs{" "}
                            {match.awayTeam?.name || "TBA"}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "12px", color: "#6b7280" }}
                          >
                            Kolo {match.round || "-"}
                          </Typography>
                        </Box>
                        <Box component='td' sx={{ px: 3, py: 2 }}>
                          {getCompetitionBadge(match.competition)}
                        </Box>
                        <Box component='td' sx={{ px: 3, py: 2 }}>
                          <Typography sx={{ fontSize: "14px", color: "#fff" }}>
                            {match.venue?.name || "TBA"}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "12px", color: "#6b7280" }}
                          >
                            {match.venue?.city || ""}
                          </Typography>
                        </Box>
                        <Box component='td' sx={{ px: 3, py: 2 }}>
                          {getStatusBadge(match)}
                        </Box>
                        <Box
                          component='td'
                          sx={{ px: 3, py: 2, textAlign: "right" }}
                        >
                          {!match.delegationStatus ||
                          match.delegationStatus === "pending" ? (
                            <Box
                              onClick={() =>
                                navigate(`/delegate/delegation/${match.id}`)
                              }
                              sx={{
                                display: "inline-block",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#f97316",
                                cursor: "pointer",
                                transition: "color 0.2s",
                                "&:hover": { color: "#fb923c" },
                              }}
                            >
                              Delegiraj →
                            </Box>
                          ) : (
                            <Box
                              onClick={() =>
                                navigate(`/delegate/delegation/${match.id}`)
                              }
                              sx={{
                                display: "inline-block",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#9ca3af",
                                cursor: "pointer",
                                transition: "color 0.2s",
                                "&:hover": { color: "#fff" },
                              }}
                            >
                              Detalji →
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MatchesPage;
