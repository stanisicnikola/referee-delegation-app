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
  Skeleton,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as MatchesIcon,
} from "@mui/icons-material";
import {
  useMatches,
  useCompetitions,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
} from "../../hooks";
import MatchModal from "../../components/ui/MatchModal";
import { ConfirmDialog, DeleteButton, EditButton } from "../../components/ui";

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

  const { data: matchesData, isLoading } = useMatches({
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
  const competitions =
    competitionsData?.data || competitionsData?.competitions || [];

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
        size='small'
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
      if (editingMatch) {
        await updateMatch.mutateAsync({ id: editingMatch.id, data: formData });
      } else {
        await createMatch.mutateAsync(formData);
      }
      setModalOpen(false);
      setEditingMatch(null);
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  const handleOpenModal = (match = null) => {
    setEditingMatch(match);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMatch(null);
  };

  const handleDelete = async () => {
    try {
      await deleteMatch.mutateAsync(matchToDelete.id);
    } catch (error) {
      console.error("Error deleting match:", error);
    } finally {
      setMatchToDelete(null);
    }
  };

  const renderManagementActions = (match) => (
    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
      <EditButton
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal(match);
        }}
      />
      <DeleteButton
        onClick={(e) => {
          e.stopPropagation();
          setMatchToDelete(match);
        }}
      />
    </Box>
  );

  const paginationFooter = (
    <TablePagination
      component='div'
      count={totalMatches}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
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
              Matches
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Manage match schedule
            </Typography>
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
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            New match
          </Button>
        </Box>
      </Box>

      <Box>
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", md: "row" },
            flexWrap: { md: "wrap" },
          }}
        >
          <TextField
            placeholder='Search matches...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              ...inputStyles,
              flex: 1,
              width: "100%",
              minWidth: { xs: "100%", md: 260 },
            }}
          />

          <FormControl
            sx={{
              width: { xs: "100%", md: "auto" },
              minWidth: { xs: "100%", md: 180 },
              ...inputStyles,
            }}
          >
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
              <MenuItem value='all'>All competitions</MenuItem>
              {competitions.map((comp) => (
                <MenuItem key={comp.id} value={comp.id}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              width: { xs: "100%", md: "auto" },
              minWidth: { xs: "100%", md: 180 },
              ...inputStyles,
            }}
          >
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
              <MenuItem value='all'>All statuses</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='partial'>Partial</MenuItem>
              <MenuItem value='complete'>Crew assigned</MenuItem>
              <MenuItem value='confirmed'>Confirmed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Mobile cards */}
        <Box
          sx={{
            display: { xs: "grid", md: "none" },
            gap: 1.5,
          }}
        >
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: "#121214",
                  borderRadius: "14px",
                  border: "1px solid #242428",
                  p: 2,
                }}
              >
                <Skeleton
                  variant='rounded'
                  height={18}
                  width='55%'
                  sx={{ bgcolor: "#1e1e22", mb: 1.5 }}
                />
                <Skeleton
                  variant='text'
                  height={28}
                  width='80%'
                  sx={{ bgcolor: "#1e1e22" }}
                />
                <Skeleton
                  variant='text'
                  height={18}
                  width='45%'
                  sx={{ bgcolor: "#1e1e22" }}
                />
              </Box>
            ))
          ) : matches.length === 0 ? (
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "14px",
                border: "1px solid #242428",
                py: 5,
                px: 2,
                textAlign: "center",
              }}
            >
              <MatchesIcon sx={{ fontSize: 28, color: "#6b7280", mb: 1 }} />
              <Typography sx={{ color: "#9ca3af", fontWeight: 600 }}>
                No matches found
              </Typography>
              <Typography sx={{ color: "#4b5563", fontSize: 13, mt: 0.5 }}>
                Try adjusting your filters
              </Typography>
            </Box>
          ) : (
            matches.map((match) => {
              const dateInfo = formatDate(match.scheduledAt);
              return (
                <Box
                  key={match.id}
                  onClick={() => navigate(`/delegate/delegation/${match.id}`)}
                  sx={{
                    bgcolor: "#121214",
                    borderRadius: "14px",
                    border: "1px solid #242428",
                    p: 2,
                    display: "grid",
                    gap: 1.5,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    "&:hover": {
                      borderColor: "rgba(249,115,22,0.35)",
                      bgcolor: "rgba(249,115,22,0.03)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
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
                    <Box sx={{ flexShrink: 0 }}>
                      {getCompetitionBadge(match.competition)}
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#f3f4f6",
                        lineHeight: 1.35,
                      }}
                    >
                      {match.homeTeam?.name || "TBA"}
                      <Box
                        component='span'
                        sx={{ color: "#4b5563", fontWeight: 500, mx: 0.75 }}
                      >
                        vs
                      </Box>
                      {match.awayTeam?.name || "TBA"}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                      Round {match.round || "–"}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#e5e7eb",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {match.venue?.name || "TBA"}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                      {match.venue?.city || ""}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      flexWrap: "wrap",
                      pt: 1,
                      borderTop: "1px solid #1a1a1d",
                    }}
                  >
                    {getStatusBadge(match)}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      {getActionButton(match)}
                      {renderManagementActions(match)}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
          {!isLoading && totalMatches > 0 && (
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
        </Box>

        {/* Desktop table */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            overflow: "hidden",
            maxWidth: "100%",
            display: { xs: "none", md: "block" },
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
                {[
                  "Date",
                  "Match",
                  "Competition",
                  "Venue",
                  "Delegation Status",
                ].map((label) => (
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
                ))}
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
                    <Skeleton
                      variant='text'
                      width={72}
                      height={18}
                      sx={{ bgcolor: "#1e1e22" }}
                    />
                    <Skeleton
                      variant='text'
                      width={44}
                      height={15}
                      sx={{ bgcolor: "#1e1e22" }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant='text'
                      width='55%'
                      height={18}
                      sx={{ bgcolor: "#1e1e22" }}
                    />
                    <Skeleton
                      variant='text'
                      width='30%'
                      height={15}
                      sx={{ bgcolor: "#1e1e22" }}
                    />
                  </Box>
                  <Skeleton
                    variant='rounded'
                    width={80}
                    height={22}
                    sx={{ bgcolor: "#1e1e22", flexShrink: 0 }}
                  />
                  <Box sx={{ width: 130, flexShrink: 0 }}>
                    <Skeleton
                      variant='text'
                      width={100}
                      height={18}
                      sx={{ bgcolor: "#1e1e22" }}
                    />
                    <Skeleton
                      variant='text'
                      width={60}
                      height={15}
                      sx={{ bgcolor: "#1e1e22" }}
                    />
                  </Box>
                  <Skeleton
                    variant='rounded'
                    width={96}
                    height={26}
                    sx={{
                      bgcolor: "#1e1e22",
                      borderRadius: "9999px",
                      flexShrink: 0,
                    }}
                  />
                  <Skeleton
                    variant='rounded'
                    width={76}
                    height={30}
                    sx={{
                      bgcolor: "#1e1e22",
                      borderRadius: "8px",
                      flexShrink: 0,
                      ml: "auto",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": { height: 8 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#2e2e33",
                  borderRadius: "9999px",
                },
              }}
            >
              <Box
                component='table'
                sx={{
                  width: "100%",
                  minWidth: 880,
                  borderCollapse: "collapse",
                }}
              >
                <Box component='thead'>
                  <Box
                    component='tr'
                    sx={{ borderBottom: "1px solid #242428" }}
                  >
                    {[
                      "Date",
                      "Match",
                      "Competition",
                      "Venue",
                      "Delegation Status",
                      "",
                    ].map((header, i) => (
                      <Box
                        key={header || `col-${i}`}
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
                          whiteSpace: "nowrap",
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
                            <MatchesIcon
                              sx={{ fontSize: 24, color: "#6b7280" }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              color: "#9ca3af",
                              fontSize: 15,
                              fontWeight: 600,
                            }}
                          >
                            No matches found
                          </Typography>
                          <Typography sx={{ color: "#4b5563", fontSize: 13 }}>
                            {search ||
                            competitionFilter !== "all" ||
                            statusFilter !== "all"
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
                          component='tr'
                          onClick={() =>
                            navigate(`/delegate/delegation/${match.id}`)
                          }
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
                            component='td'
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
                                fontWeight: 600,
                                color: "#f3f4f6",
                              }}
                            >
                              {match.homeTeam?.name || "TBA"}{" "}
                              <Box
                                padding='0 4px'
                                component='span'
                                sx={{ color: "#4b5563", fontWeight: 400 }}
                              >
                                vs
                              </Box>{" "}
                              {match.awayTeam?.name || "TBA"}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "12px", color: "#6b7280" }}
                            >
                              Round {match.round || "–"}
                            </Typography>
                          </Box>

                          <Box component='td' sx={{ px: 3, py: 2 }}>
                            {getCompetitionBadge(match.competition)}
                          </Box>

                          <Box component='td' sx={{ px: 3, py: 2 }}>
                            <Typography
                              sx={{ fontSize: "13px", color: "#e5e7eb" }}
                            >
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
                            sx={{
                              px: 3,
                              py: 2,
                              textAlign: "right",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "flex-end",
                              }}
                            >
                              {getActionButton(match)}
                              {renderManagementActions(match)}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
              {paginationFooter}
            </Box>
          )}
        </Box>
      </Box>

      <MatchModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createMatch.isPending || updateMatch.isPending}
        editMatch={editingMatch}
      />

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
