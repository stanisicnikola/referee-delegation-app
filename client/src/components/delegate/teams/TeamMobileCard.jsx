import { Avatar, Box, IconButton, Typography } from "@mui/material";
import {
  LocationOn as LocationIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";

const getTeamShortLabel = (team) =>
  team.shortName?.toUpperCase() ||
  team.name?.substring(0, 3).toUpperCase() ||
  "N/A";

const TeamMobileCard = ({
  team,
  matchesCount,
  isMatchesLoading,
  onMenuOpen,
}) => (
  <Box
    sx={{
      bgcolor: "#121214",
      borderRadius: "14px",
      border: "1px solid #242428",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Avatar
        src={team.logoUrl || undefined}
        sx={{
          width: 48,
          height: 48,
          bgcolor: "#f9731620",
          color: "#f97316",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {getTeamShortLabel(team)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {team.name}
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: "13px" }}>
          {getTeamShortLabel(team)}
        </Typography>
      </Box>

      <IconButton
        size='small'
        onClick={(event) => onMenuOpen(event, team)}
        sx={{
          color: "#6b7280",
          flexShrink: 0,
          "&:hover": { bgcolor: "#242428" },
        }}
      >
        <MoreIcon />
      </IconButton>
    </Box>

    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderTop: "1px solid #242428",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 1.5,
        alignItems: "center",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#9ca3af",
            mb: 0.75,
            minWidth: 0,
          }}
        >
          <LocationIcon sx={{ fontSize: 16, flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {team.city || "N/A"}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            color: "#6b7280",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {team.primaryVenue?.name || "N/A"}
        </Typography>
      </Box>
      <Box
        sx={{
          textAlign: "center",
          px: 1.5,
          py: 0.75,
          borderRadius: "10px",
          bgcolor: "#0a0a0b",
          border: "1px solid #1a1a1d",
        }}
      >
        <Typography sx={{ fontWeight: 700, color: "#fff" }}>
          {isMatchesLoading ? "..." : matchesCount}
        </Typography>
        <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
          matches
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default TeamMobileCard;
