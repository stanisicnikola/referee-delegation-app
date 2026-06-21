import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { CalendarMonth as MatchesIcon } from "@mui/icons-material";
import DashboardSectionHeader from "./DashboardSectionHeader";
import UpcomingMatchRow from "./UpcomingMatchRow";
import { delegatePanelColors as COLORS } from "../../../theme/theme";

const UpcomingMatchSkeleton = ({ isLast }) => (
  <Box
    sx={{
      px: { xs: 2.25, md: 3 },
      py: 2.25,
      display: "grid",
      gridTemplateColumns: {
        xs: "54px minmax(0, 1fr)",
        sm: "62px minmax(0, 1fr) 132px",
      },
      alignItems: "center",
      gap: { xs: 1.5, sm: 2.5 },
      borderBottom: isLast ? "none" : `1px solid ${COLORS.borderSoft}`,
    }}
  >
    <Skeleton
      variant='rounded'
      width='100%'
      height={64}
      sx={{ bgcolor: COLORS.panel, borderRadius: "8px" }}
    />
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Skeleton
          variant='rounded'
          width={90}
          height={24}
          sx={{ bgcolor: COLORS.panel }}
        />
        <Skeleton
          variant='rounded'
          width={70}
          height={24}
          sx={{ bgcolor: COLORS.panel }}
        />
      </Box>
      <Skeleton
        variant='text'
        width='70%'
        height={24}
        sx={{ bgcolor: COLORS.panel }}
      />
      <Skeleton
        variant='text'
        width='45%'
        height={18}
        sx={{ bgcolor: COLORS.panel, mt: 0.25 }}
      />
    </Box>
    <Skeleton
      variant='rounded'
      width='100%'
      height={30}
      sx={{
        display: { xs: "none", sm: "block" },
        bgcolor: COLORS.panel,
        borderRadius: "9999px",
      }}
    />
  </Box>
);

const EmptyState = () => (
  <Box
    sx={{
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      p: 4,
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "8px",
        bgcolor: "rgba(249, 115, 22, 0.08)",
        border: "1px solid rgba(249, 115, 22, 0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 1.5,
      }}
    >
      <MatchesIcon sx={{ fontSize: 28, color: COLORS.accent }} />
    </Box>
    <Typography sx={{ color: COLORS.text, fontWeight: 800 }}>
      No upcoming matches
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.5 }}>
      New fixtures will appear here when they are scheduled.
    </Typography>
  </Box>
);

const UpcomingMatchesCard = ({ matches, loading, onViewAll, onOpenMatch }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
      minHeight: 520,
    }}
  >
    <DashboardSectionHeader
      title='Upcoming matches'
      subtitle='Next scheduled fixtures'
      actionLabel='View all'
      onAction={onViewAll}
    />

    {loading ? (
      <Box>
        {Array.from({ length: 4 }).map((_, index) => (
          <UpcomingMatchSkeleton key={index} isLast={index === 3} />
        ))}
      </Box>
    ) : matches.length === 0 ? (
      <EmptyState />
    ) : (
      <Box>
        {matches.map((match, index) => (
          <UpcomingMatchRow
            key={match.id || index}
            match={match}
            isLast={index === matches.length - 1}
            onOpen={onOpenMatch}
          />
        ))}
      </Box>
    )}
  </Paper>
);

export default UpcomingMatchesCard;
