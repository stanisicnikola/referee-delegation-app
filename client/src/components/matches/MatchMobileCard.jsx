import { Box, Skeleton, Typography } from "@mui/material";
import { CalendarMonth as MatchesIcon } from "@mui/icons-material";
import MatchTitle from "../../utils/MatchTitle";
import { delegatePanelColors as COLORS } from "../../theme/theme";
import CompetitionBadge from "./CompetitionBadge";
import MatchDateTime from "./MatchDateTime";
import MatchVenue from "./MatchVenue";

export const MatchMobileEmptyState = ({ hasFilters }) => (
  <Box
    sx={{
      bgcolor: COLORS.card,
      borderRadius: "14px",
      border: `1px solid ${COLORS.border}`,
      py: 5,
      px: 2,
      textAlign: "center",
    }}
  >
    <MatchesIcon sx={{ fontSize: 28, color: COLORS.muted, mb: 1 }} />
    <Typography sx={{ color: COLORS.mutedStrong, fontWeight: 700 }}>
      No matches found
    </Typography>
    <Typography sx={{ color: COLORS.muted, fontSize: 13, mt: 0.5 }}>
      {hasFilters ? "Try adjusting your filters" : "No matches available"}
    </Typography>
  </Box>
);

export const MatchMobileSkeleton = () => (
  <Box
    sx={{
      bgcolor: COLORS.card,
      borderRadius: "14px",
      border: `1px solid ${COLORS.border}`,
      p: 2,
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
      <Box>
        <Skeleton width={90} height={18} sx={{ bgcolor: COLORS.panel }} />
        <Skeleton width={52} height={16} sx={{ bgcolor: COLORS.panel }} />
      </Box>
      <Skeleton
        variant='rounded'
        width={96}
        height={24}
        sx={{ bgcolor: COLORS.panel, borderRadius: "6px" }}
      />
    </Box>
    <Skeleton width='82%' height={26} sx={{ bgcolor: COLORS.panel }} />
    <Skeleton width='34%' height={18} sx={{ bgcolor: COLORS.panel, mb: 1 }} />
    <Skeleton width='58%' height={20} sx={{ bgcolor: COLORS.panel }} />
    <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 1.5 }}>
      <Skeleton
        variant='rounded'
        width={104}
        height={28}
        sx={{ bgcolor: COLORS.panel, borderRadius: "9999px" }}
      />
      <Skeleton
        variant='rounded'
        width={78}
        height={30}
        sx={{ bgcolor: COLORS.panel, borderRadius: "8px" }}
      />
    </Box>
  </Box>
);

const MatchMobileCard = ({
  match,
  onClick,
  status,
  primaryAction,
  actions,
  accentColor = COLORS.accent,
}) => {
  const clickable = Boolean(onClick);

  return (
    <Box
      onClick={clickable ? () => onClick(match) : undefined}
      sx={{
        bgcolor: COLORS.card,
        borderRadius: "14px",
        border: `1px solid ${COLORS.border}`,
        p: { xs: 1.5, sm: 2 },
        display: "grid",
        gap: 1.35,
        cursor: clickable ? "pointer" : "default",
        transition: "border-color 0.15s ease, background 0.15s ease",
        "&:hover": clickable
          ? {
              borderColor: `${accentColor}55`,
              bgcolor: `${accentColor}08`,
            }
          : undefined,
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
        <MatchDateTime scheduledAt={match.scheduledAt} />
        <Box sx={{ flexShrink: 0, minWidth: 0 }}>
          <CompetitionBadge competition={match.competition} />
        </Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: COLORS.text,
            lineHeight: 1.35,
          }}
        >
          <MatchTitle match={match} />
        </Typography>
        <Typography sx={{ fontSize: 12, color: COLORS.muted }}>
          Round {match.round || "-"}
        </Typography>
      </Box>

      <MatchVenue venue={match.venue} />

      {(status || primaryAction || actions) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
            pt: 1,
            borderTop: `1px solid ${COLORS.panel}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>{status}</Box>
          {(primaryAction || actions) && (
            <Box
              onClick={(event) => event.stopPropagation()}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                ml: "auto",
              }}
            >
              {primaryAction}
              {actions}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MatchMobileCard;
