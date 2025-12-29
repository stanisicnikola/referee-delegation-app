import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  SportsSoccer as MatchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as AssignedIcon,
  Warning as PendingIcon,
  AccessTime as TimeIcon,
  Person as RefereeIcon,
  Edit as EditIcon,
  AssignmentInd as DelegateIcon,
} from "@mui/icons-material";
import { useMatches } from "../../hooks/admin";

const DelegationsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data, isLoading, refetch } = useMatches({});

  const matches = data?.matches || [];

  const pendingMatches = matches.filter(
    (m) => !m.referees || m.referees.length === 0
  );
  const assignedMatches = matches.filter(
    (m) => m.referees && m.referees.length > 0
  );

  const displayMatches =
    statusFilter === "pending"
      ? pendingMatches
      : statusFilter === "assigned"
      ? assignedMatches
      : matches;

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("bs-BA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("bs-BA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      weekday: date.toLocaleDateString("bs-BA", { weekday: "short" }),
    };
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: "28px", fontWeight: 700, color: "#fff", mb: 0.5 }}
          >
            Delegations
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Assign referees and delegates to matches
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => refetch()}
              sx={{
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
                borderRadius: "12px",
                color: "#9ca3af",
                "&:hover": { bgcolor: "#242428", color: "#fff" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Export'>
            <IconButton
              sx={{
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
                borderRadius: "12px",
                color: "#9ca3af",
                "&:hover": { bgcolor: "#242428", color: "#fff" },
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        {[
          {
            label: "Total Matches",
            value: matches.length,
            icon: MatchIcon,
            color: "#8b5cf6",
          },
          {
            label: "Pending Delegation",
            value: pendingMatches.length,
            icon: PendingIcon,
            color: "#eab308",
          },
          {
            label: "Assigned",
            value: assignedMatches.length,
            icon: AssignedIcon,
            color: "#22c55e",
          },
          {
            label: "This Week",
            value: 5,
            icon: CalendarIcon,
            color: "#3b82f6",
          },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              p: 2.5,
              bgcolor: "#121214",
              border: "1px solid #242428",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <stat.icon sx={{ fontSize: 24, color: stat.color }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
              >
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: 2,
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
          sx={{ ...inputStyles, flex: 1, maxWidth: 400 }}
        />
        <FormControl sx={{ minWidth: 180, ...inputStyles }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ "& .MuiSelect-select": { color: "#fff" } }}
          >
            <MenuItem value='all'>All Matches</MenuItem>
            <MenuItem value='pending'>Pending Delegation</MenuItem>
            <MenuItem value='assigned'>Assigned</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Matches List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "#8b5cf6" }} />
          </Box>
        ) : displayMatches.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#121214",
              border: "1px solid #242428",
              borderRadius: "16px",
              p: 8,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#6b7280" }}>No matches found</Typography>
          </Box>
        ) : (
          displayMatches.map((match) => {
            const { time, weekday } = formatDateTime(match.dateTime);
            const hasReferees = match.referees && match.referees.length > 0;
            return (
              <Box
                key={match.id}
                sx={{
                  bgcolor: "#121214",
                  border: "1px solid #242428",
                  borderRadius: "16px",
                  p: 3,
                  display: "flex",
                  gap: 3,
                  "&:hover": { borderColor: "#3f3f46" },
                  transition: "all 0.2s",
                }}
              >
                {/* Date */}
                <Box
                  sx={{
                    minWidth: 80,
                    textAlign: "center",
                    p: 2,
                    bgcolor: "#1a1a1d",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    {weekday}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
                  >
                    {new Date(match.dateTime).getDate()}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(match.dateTime).toLocaleDateString("bs-BA", {
                      month: "short",
                    })}
                  </Typography>
                </Box>

                {/* Match Info */}
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}
                    >
                      {match.homeTeam?.name || "TBD"} vs{" "}
                      {match.awayTeam?.name || "TBD"}
                    </Typography>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "20px",
                        bgcolor: hasReferees
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(234, 179, 8, 0.15)",
                        border: `1px solid ${
                          hasReferees ? "#22c55e30" : "#eab30830"
                        }`,
                      }}
                    >
                      {hasReferees ? (
                        <AssignedIcon sx={{ fontSize: 12, color: "#22c55e" }} />
                      ) : (
                        <PendingIcon sx={{ fontSize: 12, color: "#eab308" }} />
                      )}
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: hasReferees ? "#22c55e" : "#eab308",
                        }}
                      >
                        {hasReferees ? "Assigned" : "Pending"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      color: "#6b7280",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <TimeIcon sx={{ fontSize: 16 }} />
                      <Typography
                        sx={{ fontSize: "14px", fontFamily: "monospace" }}
                      >
                        {time}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <LocationIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: "14px" }}>
                        {match.venue?.name || "TBD"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <MatchIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: "14px" }}>
                        {match.competition?.name || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Referees */}
                <Box
                  sx={{
                    minWidth: 280,
                    p: 2,
                    bgcolor: "#1a1a1d",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    Assigned Officials
                  </Typography>
                  {hasReferees ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {match.referees.slice(0, 3).map((ref, i) => (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "#8b5cf620",
                              color: "#8b5cf6",
                              fontSize: "11px",
                            }}
                          >
                            {ref.user?.firstName?.[0]}
                            {ref.user?.lastName?.[0]}
                          </Avatar>
                          <Typography sx={{ fontSize: "13px", color: "#fff" }}>
                            {ref.user?.firstName} {ref.user?.lastName}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      No referees assigned
                    </Typography>
                  )}
                </Box>

                {/* Action */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    startIcon={hasReferees ? <EditIcon /> : <DelegateIcon />}
                    sx={{
                      px: 3,
                      py: 1.25,
                      borderRadius: "12px",
                      bgcolor: hasReferees ? "#242428" : "#8b5cf6",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 500,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: hasReferees ? "#3f3f46" : "#7c3aed",
                      },
                    }}
                  >
                    {hasReferees ? "Edit" : "Delegate"}
                  </Button>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default DelegationsPage;
