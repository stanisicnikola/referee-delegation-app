import { Box, Chip, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { EventAvailable as EventAvailableIcon } from "@mui/icons-material";
import { DeleteButton } from "../../ui";
import {
  AVAILABILITY_COLORS as COLORS,
  AVAILABILITY_STATUS_META,
} from "./constants";
import { formatDateRange } from "./availabilityUtils";

const getStatusMeta = (theme, status) => {
  const meta = AVAILABILITY_STATUS_META[status] || AVAILABILITY_STATUS_META.pending;
  const color = theme.palette[meta.palette].main;

  return { ...meta, color };
};

const AvailabilityPeriodsSection = ({ periods, onDelete }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      sx={{
        mb: 2,
        color: COLORS.text,
        fontSize: { xs: "22px", md: "26px" },
        fontWeight: 700,
      }}
    >
      Reported unavailable periods
    </Typography>

    {periods.length === 0 ? (
      <EmptyPeriodsCard />
    ) : (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {periods.map((period) => (
          <AvailabilityPeriodCard
            key={period.key}
            period={period}
            onDelete={onDelete}
          />
        ))}
      </Box>
    )}
  </Box>
);

const EmptyPeriodsCard = () => (
  <Paper
    sx={{
      p: { xs: 3, md: 4 },
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      textAlign: "center",
    }}
  >
    <EventAvailableIcon sx={{ color: COLORS.green, fontSize: 36 }} />
    <Typography sx={{ mt: 1, color: COLORS.text, fontWeight: 600 }}>
      No unavailable periods reported.
    </Typography>
  </Paper>
);

const AvailabilityPeriodCard = ({ period, onDelete }) => {
  const theme = useTheme();
  const meta = getStatusMeta(theme, period.approvalStatus);
  const StatusIcon = meta.icon;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: "16px",
        bgcolor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "14px",
          bgcolor: alpha(meta.color, 0.15),
          color: meta.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <StatusIcon />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ color: COLORS.text, fontSize: 18, fontWeight: 700 }}>
          {period.reason}
        </Typography>
        <Typography sx={{ mt: 0.25, color: COLORS.muted, fontSize: 15 }}>
          {formatDateRange(period.startDate, period.endDate)}
        </Typography>
        {period.description && (
          <Typography
            sx={{
              mt: 1,
              color: COLORS.mutedStrong,
              fontSize: 14,
              overflowWrap: "anywhere",
            }}
          >
            {period.description}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          alignSelf: { xs: "stretch", sm: "center" },
          justifyContent: { xs: "space-between", sm: "flex-end" },
        }}
      >
        <Chip
          label={meta.label}
          sx={{
            bgcolor: alpha(meta.color, 0.15),
            color: meta.color,
            fontWeight: 700,
            borderRadius: "999px",
          }}
        />
        <DeleteButton tooltip='Delete request' onClick={() => onDelete(period)} />
      </Box>
    </Paper>
  );
};

export default AvailabilityPeriodsSection;
