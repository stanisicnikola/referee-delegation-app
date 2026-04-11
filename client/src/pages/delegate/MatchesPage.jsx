import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  CalendarMonth as MatchesIcon,
} from "@mui/icons-material";
import { useMatches, useCompetitions, useCreateMatch } from "../../hooks";
import MatchModal from "../../components/ui/MatchModal";
import { useAuth } from "../../context";

const MatchesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const competitionId = searchParams.get("competition");
    const status = searchParams.get("status");
    setCompetitionFilter(competitionId || "all");
    setStatusFilter(status || "all");
  }, [searchParams]);

  const { data: matchesData, isLoading } = useMatches({ limit: 100 });
  const { data: competitionsData } = useCompetitions({ limit: 100 });
  const createMatch = useCreateMatch();
  const isAdmin = user?.role === "admin";

  const allMatches = matchesData?.data || [];
  const competitions =
    competitionsData?.data || competitionsData?.competitions || [];

  const matches = allMatches.filter((match) => {
    const matchesSearch =
      search === "" ||
      match.homeTeam?.name?.toLowerCase().includes(search.toLowerCase()) ||
      match.awayTeam?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesCompetition =
      competitionFilter === "all" || match.competitionId === competitionFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && match.delegationStatus === "pending") ||
      (statusFilter === "partial" && match.delegationStatus === "partial") ||
      (statusFilter === "complete" && match.delegationStatus === "complete") ||
      (statusFilter === "confirmed" && match.delegationStatus === "confirmed");

    return matchesSearch && matchesCompetition && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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

  const getStatusBadge = (match) => {
    const statusStyles = {
      pending: {
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
        label: "Pending",
      },
      partial: {
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
        label: "Partial",
      },
      complete: {
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.12)",
        label: "Crew assigned",
      },
      confirmed: {
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        label: "Confirmed",
      },
    };

    const style = statusStyles[match.delegationStatus] || {
      color: "#9ca3af",
      bg: "rgba(156, 163, 175, 0.12)",
      label: match.delegationStatus || "Unknown",
    };

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "12px",
          fontWeight: 500,
          color: style.color,
          bgcolor: style.bg,
          border: `1px solid ${style.color}33`,
          px: 1.25,
          py: 0.5,
          borderRadius: "9999px",
          whiteSpace: "nowrap",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: style.color,
            flexShrink: 0,
          }}
        />
        {style.label}
      </Box>
    );
  };

  const getActionButton = (match) => {
    const config = {
      pending: {
        label: "Assign",
        color: "#f97316",
        bg: "rgba(249,115,22,0.09)",
        hoverBg: "rgba(249,115,22,0.16)",
      },
      partial: {
        label: "Resume",
        color: "#f97316",
        bg: "rgba(249,115,22,0.09)",
        hoverBg: "rgba(249,115,22,0.16)",
      },
      complete: {
        label: "Review",
        color: "#38bdf8",
        bg: "rgba(56,189,248,0.09)",
        hoverBg: "rgba(56,189,248,0.16)",
      },
      confirmed: {
        label: "View",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.09)",
        hoverBg: "rgba(34,197,94,0.14)",
      },
    };

    const style = config[match.delegationStatus] || {
      label: "Open",
      color: "#9ca3af",
      bg: "rgba(107,114,128,0.09)",
      hoverBg: "rgba(107,114,128,0.16)",
    };

    return (
      <Button
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/delegate/delegation/${match.id}`);
        }}
        sx={{
          px: 1.75,
          py: 0.625,
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "13px",
          fontWeight: 600,
          color: style.color,
          bgcolor: style.bg,
          border: "1px solid",
          borderColor: `${style.color}33`,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: style.hoverBg },
        }}
      >
        {style.label} →
      </Button>
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
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        {competition?.name || "N/A"}
      </Box>
    );
  };

  const handleSubmit = async (formData) => {
    try {
      await createMatch.mutateAsync(formData);
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating match:", error);
    }
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
              Matches
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Manage match schedule
            </Typography>
          </Box>
          {isAdmin ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
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
              New match
            </Button>
          ) : (
            null
          )}
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search matches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{ ...inputStyles, flex: 1, minWidth: 180 }}
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
              <MenuItem value="all">All competitions</MenuItem>
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
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
              <MenuItem value="complete">Crew assigned</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
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
            <Box>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: "1px solid #242428",
                  display: "flex",
                  gap: 3,
                }}
              >
                {["Date", "Match", "Competition", "Venue", "Status"].map(
                  (label) => (
                    <Typography
                      key={label}
                      sx={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#2e2e33",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {label}
                    </Typography>
                  )
                )}
              </Box>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    gap: 3,
                    borderBottom: i < 4 ? "1px solid #1a1a1d" : "none",
                  }}
                >
                  <Box sx={{ width: 90, flexShrink: 0 }}>
                    <Skeleton variant="text" width={72} height={18} sx={{ bgcolor: "#1e1e22" }} />
                    <Skeleton variant="text" width={44} height={15} sx={{ bgcolor: "#1e1e22" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="55%" height={18} sx={{ bgcolor: "#1e1e22" }} />
                    <Skeleton variant="text" width="30%" height={15} sx={{ bgcolor: "#1e1e22" }} />
                  </Box>
                  <Skeleton variant="rounded" width={80} height={22} sx={{ bgcolor: "#1e1e22", flexShrink: 0 }} />
                  <Box sx={{ width: 130, flexShrink: 0 }}>
                    <Skeleton variant="text" width={100} height={18} sx={{ bgcolor: "#1e1e22" }} />
                    <Skeleton variant="text" width={60} height={15} sx={{ bgcolor: "#1e1e22" }} />
                  </Box>
                  <Skeleton variant="rounded" width={96} height={26} sx={{ bgcolor: "#1e1e22", borderRadius: "9999px", flexShrink: 0 }} />
                  <Skeleton variant="rounded" width={76} height={30} sx={{ bgcolor: "#1e1e22", borderRadius: "8px", flexShrink: 0, ml: "auto" }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{ width: "100%", borderCollapse: "collapse" }}
              >
                <Box component="thead">
                  <Box
                    component="tr"
                    sx={{ borderBottom: "1px solid #242428" }}
                  >
                    {["Date", "Match", "Competition", "Venue", "Status", ""].map(
                      (header, i) => (
                        <Box
                          key={header || `col-${i}`}
                          component="th"
                          sx={{
                            textAlign: i === 5 ? "right" : "left",
                            px: 3,
                            py: 2,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
                <Box component="tbody">
                  {matches.length === 0 ? (
                    <Box component="tr">
                      <Box
                        component="td"
                        colSpan={6}
                        sx={{ textAlign: "center", py: 7 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "12px",
                              bgcolor: "rgba(107,114,128,0.07)",
                              border: "1px solid rgba(107,114,128,0.14)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <MatchesIcon sx={{ fontSize: 24, color: "#6b7280" }} />
                          </Box>
                          <Typography sx={{ color: "#9ca3af", fontSize: 15, fontWeight: 600 }}>
                            No matches found
                          </Typography>
                          <Typography sx={{ color: "#4b5563", fontSize: 13 }}>
                            {search || competitionFilter !== "all" || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "No matches available at this time"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    matches.map((match) => {
                      const dateInfo = formatDate(match.scheduledAt);
                      return (
                        <Box
                          key={match.id}
                          component="tr"
                          onClick={() => navigate(`/delegate/delegation/${match.id}`)}
                          sx={{
                            borderBottom: "1px solid #1a1a1d",
                            borderLeft: "2px solid transparent",
                            transition: "all 0.15s ease",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "rgba(249,115,22,0.03)",
                              borderLeftColor: "rgba(249,115,22,0.35)",
                            },
                            "&:last-child": { borderBottom: "none" },
                          }}
                        >
                          <Box
                            component="td"
                            sx={{ px: 3, py: 2, whiteSpace: "nowrap" }}
                          >
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontFamily: "monospace",
                                color: "#e5e7eb",
                              }}
                            >
                              {dateInfo.date}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                              {dateInfo.time}
                            </Typography>
                          </Box>

                          <Box component="td" sx={{ px: 3, py: 2 }}>
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#f3f4f6",
                              }}
                            >
                              {match.homeTeam?.name || "TBA"}{" "}
                              <Box
                                component="span"
                                sx={{ color: "#4b5563", fontWeight: 400 }}
                              >
                                vs
                              </Box>{" "}
                              {match.awayTeam?.name || "TBA"}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                              Round {match.round || "–"}
                            </Typography>
                          </Box>

                          <Box component="td" sx={{ px: 3, py: 2 }}>
                            {getCompetitionBadge(match.competition)}
                          </Box>

                          <Box component="td" sx={{ px: 3, py: 2 }}>
                            <Typography sx={{ fontSize: "13px", color: "#e5e7eb" }}>
                              {match.venue?.name || "TBA"}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                              {match.venue?.city || ""}
                            </Typography>
                          </Box>

                          <Box component="td" sx={{ px: 3, py: 2 }}>
                            {getStatusBadge(match)}
                          </Box>

                          <Box
                            component="td"
                            sx={{ px: 3, py: 2, textAlign: "right", whiteSpace: "nowrap" }}
                          >
                            {getActionButton(match)}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {isAdmin && (
        <MatchModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createMatch.isPending}
        />
      )}
    </Box>
  );
};

export default MatchesPage;
