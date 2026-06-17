import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  SportsBasketball as SportsBasketballIcon,
} from "@mui/icons-material";
import {
  MONTH_NAMES,
  WEEKDAY_SHORT_NAMES_MONDAY_FIRST,
} from "../../../constants/date";
import { AVAILABILITY_COLORS as COLORS } from "./constants";

const LEGEND_ITEMS = [
  { label: "Available", palette: "success", icon: EventAvailableIcon },
  { label: "Unavailable", palette: "error", icon: EventBusyIcon },
  { label: "Match", palette: "warning", icon: SportsBasketballIcon },
];

const AvailabilityCalendar = ({
  year,
  month,
  calendarGrid,
  approvedUnavailableDays,
  matchDaysThisMonth,
  isUpdating,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) => {
  const theme = useTheme();
  const cellStyles = getCellStyles(theme);

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: "16px",
        bgcolor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        mt: 3,
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Typography
              sx={{ color: COLORS.text, fontSize: 24, fontWeight: 700 }}
            >
              Availability Calendar - {MONTH_NAMES[month - 1]} {year}
            </Typography>
            {isUpdating && (
              <CircularProgress size={18} sx={{ color: "primary.main" }} />
            )}
          </Box>
          <Typography sx={{ mt: 0.5, color: COLORS.muted, fontSize: 14 }}>
            {approvedUnavailableDays} unavailable days, {matchDaysThisMonth}{" "}
            match days
          </Typography>
        </Box>

        <CalendarControls
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          onToday={onToday}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.75, sm: 1.25 },
        }}
      >
        {WEEKDAY_SHORT_NAMES_MONDAY_FIRST.map((day) => (
          <Typography
            key={day}
            sx={{
              py: 1,
              color: COLORS.muted,
              textAlign: "center",
              fontWeight: 700,
              fontSize: { xs: 12, sm: 14 },
            }}
          >
            {day}
          </Typography>
        ))}

        {calendarGrid.map((dayInfo) => (
          <AvailabilityCalendarDay
            key={dayInfo.dateKey}
            dayInfo={dayInfo}
            styles={cellStyles[dayInfo.status]}
          />
        ))}
      </Box>

      <CalendarLegend />
    </Paper>
  );
};

const CalendarControls = ({ onPreviousMonth, onNextMonth, onToday }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <IconButton onClick={onPreviousMonth} sx={{ color: COLORS.text }}>
      <KeyboardArrowLeftIcon />
    </IconButton>
    <Button
      startIcon={<CalendarMonthIcon />}
      onClick={onToday}
      variant='outlined'
      sx={{
        borderColor: "grey.500",
        color: "primary.main",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      Today
    </Button>
    <IconButton onClick={onNextMonth} sx={{ color: COLORS.text }}>
      <KeyboardArrowRightIcon />
    </IconButton>
  </Box>
);

const AvailabilityCalendarDay = ({ dayInfo, styles }) => {
  const tooltip =
    dayInfo.status === "match"
      ? "Match day"
      : dayInfo.status === "unavailable"
        ? dayInfo.reason || "Unavailable"
        : dayInfo.status === "available"
          ? "Available"
          : "";

  return (
    <Tooltip title={tooltip} arrow disableHoverListener={!tooltip}>
      <Box
        sx={(theme) => ({
          minHeight: { xs: 48, sm: 64, md: 72 },
          borderRadius: "10px",
          border: "1px solid",
          borderColor: styles.borderColor,
          bgcolor: styles.bgcolor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: styles.color,
          fontSize: { xs: 15, sm: 18 },
          fontWeight: 800,
          outline: dayInfo.isToday
            ? `2px solid ${alpha(theme.palette.success.main, 0.75)}`
            : "none",
          outlineOffset: "-2px",
        })}
      >
        {dayInfo.day}
      </Box>
    </Tooltip>
  );
};

const CalendarLegend = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 3,
        pt: 2.5,
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
        gap: { xs: 2, sm: 3 },
        flexWrap: "wrap",
      }}
    >
      {LEGEND_ITEMS.map((item) => {
        const Icon = item.icon;
        const color = theme.palette[item.palette].main;

        return (
          <Box
            key={item.label}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "6px",
                bgcolor: alpha(color, 0.18),
                border: `1px solid ${alpha(color, 0.55)}`,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: 14 }} />
            </Box>
            <Typography sx={{ color: COLORS.mutedStrong, fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const getCellStyles = (theme) => ({
  available: {
    color: theme.palette.success.main,
    bgcolor: alpha(theme.palette.success.main, 0.11),
    borderColor: alpha(theme.palette.success.main, 0.38),
  },
  unavailable: {
    color: theme.palette.error.main,
    bgcolor: alpha(theme.palette.error.main, 0.18),
    borderColor: alpha(theme.palette.error.main, 0.48),
  },
  match: {
    color: theme.palette.warning.light,
    bgcolor: alpha(theme.palette.warning.main, 0.2),
    borderColor: alpha(theme.palette.warning.main, 0.5),
  },
  outside: {
    color: theme.palette.grey[400],
    bgcolor: "transparent",
    borderColor: "transparent",
  },
});

export default AvailabilityCalendar;
