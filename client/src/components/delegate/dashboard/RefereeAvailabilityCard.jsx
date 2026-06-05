import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { Groups as RefereesIcon } from "@mui/icons-material";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { delegatePanelColors as COLORS } from "../../../theme/theme";
import { formatShortDateLabel } from "../../../utils/dateFormatters";

const CountPill = ({ label, value, color }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 0.9,
      py: 0.35,
      borderRadius: "9999px",
      bgcolor: `${color}18`,
      color,
      fontSize: 11,
      fontWeight: 800,
      whiteSpace: "nowrap",
    }}
  >
    {value}
    <Box component='span' sx={{ color: COLORS.mutedStrong, fontWeight: 700 }}>
      {label}
    </Box>
  </Box>
);

const AvailabilityDayRow = ({ day }) => {
  const dateInfo = formatShortDateLabel(day.date);
  const availableReferees = day.referees || [];
  const statusColor = day.availableCount > 0 ? COLORS.green : COLORS.red;
  const names = availableReferees
    .map((referee) => referee.name)
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "8px",
        bgcolor: "rgba(26, 26, 29, 0.72)",
        border: `1px solid ${COLORS.borderSoft}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box>
          <Typography sx={{ color: COLORS.text, fontWeight: 800, fontSize: 14 }}>
            {dateInfo.label}
          </Typography>
          <Typography sx={{ color: COLORS.muted, fontSize: 12 }}>
            {dateInfo.weekday}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: COLORS.mutedStrong,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: statusColor,
              flexShrink: 0,
            }}
          />
          {day.availableCount} available
        </Box>
      </Box>

      <Typography
        sx={{
          color: names ? COLORS.mutedStrong : COLORS.muted,
          fontSize: 12,
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {names || "No available referees"}
      </Typography>

      {(day.unavailableCount > 0 || day.assignedCount > 0) && (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.1 }}>
          {day.unavailableCount > 0 && (
            <CountPill
              label='unavailable'
              value={day.unavailableCount}
              color={COLORS.red}
            />
          )}
          {day.assignedCount > 0 && (
            <CountPill
              label='assigned'
              value={day.assignedCount}
              color={COLORS.blue}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

const AvailabilitySkeleton = () => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: "8px",
      bgcolor: "rgba(26, 26, 29, 0.72)",
      border: `1px solid ${COLORS.borderSoft}`,
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Box>
        <Skeleton width={70} height={20} sx={{ bgcolor: COLORS.panel }} />
        <Skeleton width={34} height={16} sx={{ bgcolor: COLORS.panel }} />
      </Box>
      <Skeleton
        variant='rounded'
        width={86}
        height={22}
        sx={{ bgcolor: COLORS.panel, borderRadius: "9999px" }}
      />
    </Box>
    <Skeleton width='88%' height={18} sx={{ bgcolor: COLORS.panel }} />
  </Box>
);

const EmptyState = () => (
  <Box
    sx={{
      py: 5,
      px: 3,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      textAlign: "center",
    }}
  >
    <RefereesIcon sx={{ color: COLORS.muted, fontSize: 34 }} />
    <Typography sx={{ color: COLORS.mutedStrong, fontWeight: 700 }}>
      No availability data
    </Typography>
  </Box>
);

const RefereeAvailabilityCard = ({ availability, loading, onViewAll }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
    }}
  >
    <DashboardSectionHeader
      title='Referee availability'
      subtitle='Next 7 days'
      actionLabel='View all'
      onAction={onViewAll}
    />

    {loading ? (
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <AvailabilitySkeleton key={index} />
        ))}
      </Box>
    ) : availability.length === 0 ? (
      <EmptyState />
    ) : (
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {availability.slice(0, 7).map((day) => (
          <AvailabilityDayRow key={day.date} day={day} />
        ))}
      </Box>
    )}
  </Paper>
);

export default RefereeAvailabilityCard;
