import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import { useMatches, useTeams } from "../../hooks";
import TeamDetailsDialog from "../../components/delegate/TeamDetailsDialog";
import TeamMatchesDialog from "../../components/delegate/TeamMatchesDialog";

const TeamsPage = () => {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTeam, setMenuTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);

  const { data: teamsData, isLoading } = useTeams({ limit: 100 });
  const { data: matchesData, isLoading: isMatchesLoading } = useMatches({
    limit: 500,
  });
  const teams = teamsData?.data || [];
  const matches = matchesData?.data || [];

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    return (
      search === "" || team.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleMenuOpen = (event, team) => {
    setAnchorEl(event.currentTarget);
    setMenuTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTeam(null);
  };

  const handleOpenDetails = () => {
    if (!menuTeam) return;
    setSelectedTeam(menuTeam);
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleOpenMatches = () => {
    if (!menuTeam) return;
    setSelectedTeam(menuTeam);
    setMatchesOpen(true);
    handleMenuClose();
  };

  const handleCloseDetails = () => setDetailsOpen(false);
  const handleCloseMatches = () => setMatchesOpen(false);

  const getTeamColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
      "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
      "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    ];
    return colors[index % colors.length];
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

  const tableCellStyles = {
    borderBottom: "1px solid #242428",
    py: 2,
    px: 2,
  };

  const matchesByTeamId = useMemo(() => {
    return matches.reduce((acc, match) => {
      const homeId = match.homeTeamId;
      const awayId = match.awayTeamId;
      if (homeId) acc[homeId] = [...(acc[homeId] || []), match];
      if (awayId) acc[awayId] = [...(acc[awayId] || []), match];
      return acc;
    }, {});
  }, [matches]);

  const selectedTeamMatches = selectedTeam
    ? (matchesByTeamId[selectedTeam.id] || []).slice().sort((a, b) => {
        return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      })
    : [];
  const getTeamMatchesCount = (teamId) => (matchesByTeamId[teamId] || []).length;

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
              Teams
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Overview of all teams in competitions
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
                <GroupsIcon sx={{ color: "#f97316", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                  {teams.length}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                  teams
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Search */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            placeholder='Search teams...'
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
        </Box>

        {/* Teams Table */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#f97316" }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#0a0a0b" }}>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Team
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Short
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      City
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Venue
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "center",
                      }}
                    >
                      Matches
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyles,
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        width: 50,
                      }}
                    ></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeams.map((team, index) => (
                    <TableRow
                      key={team.id}
                      sx={{
                        transition: "background 0.15s",
                        "&:hover": { bgcolor: "rgba(249, 115, 22, 0.05)" },
                        "&:last-child td": { borderBottom: "none" },
                      }}
                    >
                      <TableCell sx={tableCellStyles}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          {team.logoUrl ? (
                            <Avatar
                              src={team.logoUrl}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                background: getTeamColor(index),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              {team.shortName ||
                                team.name?.substring(0, 3).toUpperCase()}
                            </Box>
                          )}
                          <Typography sx={{ fontWeight: 500, color: "#fff" }}>
                            {team.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography sx={{ color: "#9ca3af", fontWeight: 500 }}>
                          {team.shortName ||
                            team.name?.substring(0, 3).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "#9ca3af",
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 16 }} />
                          <Typography sx={{ fontSize: "14px" }}>
                            {team.city || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                          {team.primaryVenue?.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ ...tableCellStyles, textAlign: "center" }}
                      >
                        <Typography sx={{ fontWeight: 500, color: "#fff" }}>
                          {isMatchesLoading ? "..." : getTeamMatchesCount(team.id)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <IconButton
                          size='small'
                          onClick={(e) => handleMenuOpen(e, team)}
                          sx={{
                            color: "#6b7280",
                            "&:hover": { bgcolor: "#242428" },
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              bgcolor: "#1a1a1d",
              border: "1px solid #242428",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              minWidth: 160,
            },
          }}
        >
          <MenuItem
            onClick={handleOpenDetails}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            View details
          </MenuItem>
          <MenuItem
            onClick={handleOpenMatches}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            View matches
          </MenuItem>
        </Menu>
        <TeamDetailsDialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          team={selectedTeam}
          matchesCount={selectedTeam ? getTeamMatchesCount(selectedTeam.id) : 0}
          isMatchesLoading={isMatchesLoading}
        />

        <TeamMatchesDialog
          open={matchesOpen}
          onClose={handleCloseMatches}
          team={selectedTeam}
          matches={selectedTeamMatches}
          isLoading={isMatchesLoading}
        />
      </Box>
    </Box>
  );
};

export default TeamsPage;
