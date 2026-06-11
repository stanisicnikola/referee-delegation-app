import { Box, Chip, Typography } from "@mui/material";
import { LocationOn as LocationIcon } from "@mui/icons-material";
import DelegationStatusBadge from "../DelegationStatusBadge";
import { delegatePanelColors as COLORS } from "../../../theme/theme";
import { formatMatchDateTile } from "../../../utils/dateFormatters";
import { getMatchTitle, getVenueLabel } from "../../../utils/matchDisplay";

const DateBlock = ({ dateInfo }) => (
  <Box
    sx={{
      width: { xs: 54, sm: 62 },
      height: { xs: 60, sm: 68 },
      borderRadius: "8px",
      bgcolor: "rgba(255, 255, 255, 0.03)",
      border: `1px solid ${COLORS.border}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      gap: 0.2,
    }}
  >
    <Typography
      sx={{
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        lineHeight: 1,
      }}
    >
      {dateInfo.weekday}
    </Typography>
    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: 21, sm: 23 },
        fontWeight: 800,
        lineHeight: 1.05,
      }}
    >
      {dateInfo.day}
    </Typography>
    <Typography
      sx={{
        color: COLORS.muted,
        fontSize: 10,
        textTransform: "uppercase",
        lineHeight: 1,
      }}
    >
      {dateInfo.month}
    </Typography>
  </Box>
);

const InfoChip = ({ label, color = COLORS.mutedStrong, bg = COLORS.panel }) => (
  <Chip
    label={label}
    size='small'
    sx={{
      height: 24,
      maxWidth: 190,
      borderRadius: "6px",
      bgcolor: bg,
      color,
      fontSize: 12,
      fontWeight: 800,
      "& .MuiChip-label": {
        px: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }}
  />
);

const UpcomingMatchRow = ({ match, isLast, onOpen }) => {
  const dateInfo = formatMatchDateTile(match.scheduledAt);
  const matchTitle = getMatchTitle(match);
  const venueLabel = getVenueLabel(match.venue);

  return (
    <Box
      component='button'
      type='button'
      onClick={() => onOpen(match)}
      sx={{
        width: "100%",
        px: { xs: 2.25, md: 3 },
        py: 2.25,
        border: 0,
        borderBottom: isLast ? "none" : `1px solid ${COLORS.borderSoft}`,
        borderLeft: "2px solid transparent",
        bgcolor: "transparent",
        color: "inherit",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 0.16s ease, border-color 0.16s ease",
        "&:hover": {
          bgcolor: "rgba(249, 115, 22, 0.04)",
          borderLeftColor:
            match.delegationStatus === "confirmed"
              ? COLORS.green
              : COLORS.accent,
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "54px minmax(0, 1fr)",
            sm: "62px minmax(0, 1fr) auto",
            md: "62px 1px minmax(0, 1fr) auto",
          },
          alignItems: "center",
          gap: { xs: 1.5, sm: 2, md: 2.5 },
        }}
      >
        <DateBlock dateInfo={dateInfo} />

        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 1,
            height: 56,
            bgcolor: COLORS.border,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            <InfoChip
              label={match.competition?.name || "League"}
              color={COLORS.accent}
              bg='rgba(249, 115, 22, 0.1)'
            />
            <InfoChip label={`Round ${match.round || "-"}`} />
          </Box>

          <Typography
            sx={{
              color: COLORS.text,
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 800,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { xs: "normal", sm: "nowrap" },
            }}
          >
            {matchTitle}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              mt: 0.7,
              minWidth: 0,
              color: COLORS.mutedStrong,
            }}
          >
            <LocationIcon sx={{ fontSize: 16, color: COLORS.muted }} />
            <Typography
              sx={{
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {venueLabel} · {dateInfo.time}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            gridColumn: { xs: "2 / 3", sm: "auto" },
            justifySelf: { xs: "start", sm: "end" },
            maxWidth: "100%",
          }}
        >
          <DelegationStatusBadge status={match.delegationStatus} />
        </Box>
      </Box>
    </Box>
  );
};

export default UpcomingMatchRow;
