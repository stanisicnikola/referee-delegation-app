import { Avatar, Box, IconButton, Typography } from "@mui/material";
import {
  LocationOn as LocationIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { DataTable } from "../../ui";

const getTeamShortLabel = (team) =>
  team.shortName?.toUpperCase() ||
  team.name?.substring(0, 3).toUpperCase() ||
  "N/A";

const DelegateTeamsTable = ({
  teams,
  loading,
  page,
  rowsPerPage,
  totalRows,
  isMatchesLoading,
  getTeamMatchesCount,
  onPageChange,
  onRowsPerPageChange,
  onMenuOpen,
}) => (
  <DataTable
    columns={[
      {
        id: "name",
        label: "Team",
        minWidth: 260,
        render: (_, team) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={team.logoUrl || undefined}
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#f9731620",
                color: "#f97316",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {getTeamShortLabel(team)}
            </Avatar>
            <Typography sx={{ fontWeight: 500, color: "#fff" }}>
              {team.name}
            </Typography>
          </Box>
        ),
      },
      {
        id: "shortName",
        label: "Short",
        minWidth: 96,
        render: (_, team) => (
          <Typography sx={{ color: "#9ca3af", fontWeight: 500 }}>
            {getTeamShortLabel(team)}
          </Typography>
        ),
      },
      {
        id: "city",
        label: "City",
        minWidth: 150,
        render: (city) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#9ca3af",
            }}
          >
            <LocationIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: "14px" }}>{city || "N/A"}</Typography>
          </Box>
        ),
      },
      {
        id: "venue",
        label: "Venue",
        minWidth: 180,
        render: (_, team) => (
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            {team.primaryVenue?.name || "N/A"}
          </Typography>
        ),
      },
      {
        id: "matches",
        label: "Matches",
        align: "center",
        width: 100,
        render: (_, team) => (
          <Typography sx={{ fontWeight: 500, color: "#fff" }}>
            {isMatchesLoading ? "..." : getTeamMatchesCount(team.id)}
          </Typography>
        ),
      },
      {
        id: "actions",
        label: "",
        align: "right",
        width: 56,
        render: (_, team) => (
          <IconButton
            size='small'
            onClick={(event) => onMenuOpen(event, team)}
            sx={{
              color: "#6b7280",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            <MoreIcon />
          </IconButton>
        ),
      },
    ]}
    data={teams}
    loading={loading}
    page={page}
    rowsPerPage={rowsPerPage}
    totalRows={totalRows}
    onPageChange={onPageChange}
    onRowsPerPageChange={onRowsPerPageChange}
    emptyMessage='No teams found'
    getRowSx={() => ({
      transition: "background 0.15s",
      "&:hover": { bgcolor: "rgba(249, 115, 22, 0.05)" },
      "&:last-child td": { borderBottom: "none" },
    })}
  />
);

export default DelegateTeamsTable;
