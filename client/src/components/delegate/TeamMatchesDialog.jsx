import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Groups as GroupsIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";

const DELEGATION_STATUS = {
  pending: { label: "Pending", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  partial: { label: "Partial", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  complete: { label: "Crew assigned", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  confirmed: { label: "Confirmed", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

const formatMatchDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TeamMatchesDialog = ({ open, onClose, team, matches = [], isLoading }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#0f0f12",
          border: "1px solid #242428",
          borderRadius: "16px",
          color: "#fff",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 3,
          borderBottom: "1px solid #242428",
          background:
            "linear-gradient(180deg, rgba(249,115,22,0.06) 0%, transparent 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Avatar
            src={team?.logoUrl || undefined}
            sx={{
              width: 56,
              height: 56,
              bgcolor: "#1a1a1d",
              border: "1px solid #242428",
              flexShrink: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "#f97316",
            }}
          >
            {!team?.logoUrl && (
              team?.shortName?.slice(0, 2).toUpperCase() ||
              <GroupsIcon sx={{ fontSize: 24, color: "#f97316" }} />
            )}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
              {team?.name || "Team"}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.25 }}>
              {isLoading
                ? "Loading matches…"
                : `${matches.length} match${matches.length !== 1 ? "es" : ""} found`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress sx={{ color: "#f97316" }} />
          </Box>
        ) : matches.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              py: 5,
            }}
          >
            <CalendarIcon sx={{ fontSize: 40, color: "#3f3f46" }} />
            <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
              No matches found for this team.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {matches.map((match) => {
              const ds = DELEGATION_STATUS[match.delegationStatus];
              const statusChip = ds || {
                label: match.delegationStatus || "Unknown",
                color: "#9ca3af",
                bg: "rgba(156,163,175,0.12)",
              };
              const dateStr = formatMatchDate(match.scheduledAt);

              return (
                <Box
                  key={match.id}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "#121214",
                    border: "1px solid #242428",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    transition: "border-color 0.15s",
                    "&:hover": { borderColor: "#3f3f46" },
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#fff",
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {match.homeTeam?.name || "Home"}{" "}
                      <Box component='span' sx={{ color: "#6b7280", fontWeight: 400 }}>
                        vs
                      </Box>{" "}
                      {match.awayTeam?.name || "Away"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {dateStr && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "#9ca3af",
                          }}
                        >
                          <CalendarIcon sx={{ fontSize: 13 }} />
                          <Typography sx={{ fontSize: "12px" }}>
                            {dateStr}
                          </Typography>
                        </Box>
                      )}
                      {match.competition?.name && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "#9ca3af",
                          }}
                        >
                          <TrophyIcon sx={{ fontSize: 13 }} />
                          <Typography sx={{ fontSize: "12px" }}>
                            {match.competition.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    label={statusChip.label}
                    size='small'
                    sx={{
                      flexShrink: 0,
                      color: statusChip.color,
                      bgcolor: statusChip.bg,
                      border: `1px solid ${statusChip.color}33`,
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #242428" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#f97316",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(249, 115, 22, 0.08)" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMatchesDialog;
