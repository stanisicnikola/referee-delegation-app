import { useState } from "react";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { EventAvailable as EventAvailableIcon } from "@mui/icons-material";
import { CustomButton, DeleteButton } from "../../ui";
import {
  AVAILABILITY_COLORS as COLORS,
  AVAILABILITY_STATUS_META,
} from "./constants";
import { formatDateRange } from "./availabilityUtils";

const COLLAPSED_PERIOD_LIMIT = 2;

const getStatusMeta = (theme, status) => {
  const meta =
    AVAILABILITY_STATUS_META[status] || AVAILABILITY_STATUS_META.pending;
  const color = theme.palette[meta.palette].main;

  return { ...meta, color };
};

const AvailabilityPeriodsSection = ({ periods, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const canToggle = periods.length > COLLAPSED_PERIOD_LIMIT;
  const visiblePeriods = expanded
    ? periods
    : periods.slice(0, COLLAPSED_PERIOD_LIMIT);

  return (
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
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {visiblePeriods.map((period) => (
              <AvailabilityPeriodCard
                key={period.key}
                period={period}
                onDelete={onDelete}
              />
            ))}
          </Box>

          {canToggle && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
              <Button
                type='button'
                onClick={() => setExpanded((value) => !value)}
                sx={{
                  color: COLORS.green,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "10px",
                  px: 1.5,
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(34, 197, 94, 0.08)" },
                }}
              >
                {expanded
                  ? "Show less"
                  : `Show more (${periods.length - COLLAPSED_PERIOD_LIMIT})`}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

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
        <DeleteButton
          tooltip='Delete request'
          onClick={() => onDelete(period)}
        />
      </Box>
    </Paper>
  );
};

export default AvailabilityPeriodsSection;
