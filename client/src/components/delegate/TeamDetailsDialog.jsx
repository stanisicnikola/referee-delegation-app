import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
} from "@mui/material";
import { Groups as GroupsIcon } from "@mui/icons-material";

const statusStyles = {
  active: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  inactive: { label: "Inactive", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const TeamDetailsDialog = ({
  open,
  onClose,
  team,
  matchesCount = 0,
  isMatchesLoading = false,
}) => {
  const status = team?.status?.toLowerCase();
  const statusStyle = statusStyles[status] || {
    label: team?.status,
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.1)",
  };

  const infoFields = [
    { label: "Short Name", value: team?.shortName },
    { label: "City", value: team?.city },
    { label: "Primary Venue", value: team?.primaryVenue?.name },
    {
      label: "Matches",
      value: isMatchesLoading ? "Loading…" : String(matchesCount),
    },
  ].filter((f) => f.value);

  const contactFields = [
    { label: "Contact Person", value: team?.contactPerson },
    { label: "Contact Email", value: team?.contactEmail },
    { label: "Contact Phone", value: team?.contactPhone },
  ].filter((f) => f.value);

  const sections = [
    { title: "Team Info", fields: infoFields },
    { title: "Contact", fields: contactFields },
  ].filter((s) => s.fields.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
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
              width: 64,
              height: 64,
              bgcolor: "#1a1a1d",
              border: "1px solid #242428",
              flexShrink: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#f97316",
            }}
          >
            {!team?.logoUrl && (
              team?.shortName?.slice(0, 2).toUpperCase() ||
              <GroupsIcon sx={{ fontSize: 28, color: "#f97316" }} />
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
              {team?.name || "Team"}
            </Typography>
            {team?.status && (
              <Box sx={{ display: "flex", gap: 1, mt: 0.75 }}>
                <Chip
                  label={statusStyle.label}
                  size='small'
                  sx={{
                    bgcolor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.color}33`,
                    fontWeight: 600,
                    fontSize: "12px",
                    height: 24,
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        {sections.length === 0 ? (
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: "14px",
              textAlign: "center",
              py: 3,
            }}
          >
            No additional team details available.
          </Typography>
        ) : (
          sections.map((section, si) => (
            <Box
              key={section.title}
              sx={{ mb: si < sections.length - 1 ? 3 : 0 }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#f97316",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  mb: 1.5,
                }}
              >
                {section.title}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {section.fields.map((field) => (
                  <Box
                    key={field.label}
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      bgcolor: "#121214",
                      border: "1px solid #242428",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "11px", color: "#6b7280", mb: 0.5 }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#fff",
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {field.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, borderTop: "1px solid #242428" }}
      >
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

export default TeamDetailsDialog;
