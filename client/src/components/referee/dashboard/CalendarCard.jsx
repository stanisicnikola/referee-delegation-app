import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { WEEKDAY_SHORT_NAMES_MONDAY_FIRST } from "../../../constants/date";
import { DASHBOARD_COLORS as COLORS } from "./constants";

const calendarButtonSx = (theme) => ({
  color: COLORS.mutedStrong,
  borderRadius: "8px",
  "&:hover": {
    color: COLORS.text,
    bgcolor: alpha(theme.palette.common.white, 0.06),
  },
});

const CalendarDay = ({ dayData }) => {
  if (dayData.type === "empty") {
    return <Box sx={{ minHeight: { xs: 34, sm: 42 } }} />;
  }

  const isMatch = dayData.type === "match";

  return (
    <Tooltip title={isMatch ? "Match scheduled" : ""} arrow disableInteractive>
      <Box
        sx={(theme) => ({
          minHeight: { xs: 34, sm: 42 },
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: isMatch ? COLORS.orange : COLORS.text,
          bgcolor: isMatch ? alpha(COLORS.orange, 0.14) : "transparent",
          border: dayData.isToday
            ? `2px solid ${COLORS.green}`
            : isMatch
              ? `1px solid ${COLORS.orange}`
              : "1px solid transparent",
          fontWeight: dayData.isToday || isMatch ? 800 : 600,
          cursor: isMatch ? "pointer" : "default",
          transition: "background-color 0.16s ease, border-color 0.16s ease",
          "&:hover": {
            bgcolor: isMatch
              ? alpha(COLORS.orange, 0.2)
              : alpha(theme.palette.common.white, 0.05),
          },
        })}
      >
        <Typography sx={{ fontSize: 14, fontWeight: "inherit" }}>
          {dayData.day}
        </Typography>
      </Box>
    </Tooltip>
  );
};

const CalendarCard = ({
  calendar,
  isSmall,
  isUpdating = false,
  onPrev,
  onNext,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.25, md: 3 },
      borderRadius: "16px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          {calendar.monthLabel}
        </Typography>
        {isUpdating && (
          <CircularProgress size={16} sx={{ color: "primary.main" }} />
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton size='small' onClick={onPrev} sx={calendarButtonSx}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton size='small' onClick={onNext} sx={calendarButtonSx}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0.75,
        mb: 1,
      }}
    >
      {WEEKDAY_SHORT_NAMES_MONDAY_FIRST.map((day) => (
        <Box key={day} sx={{ textAlign: "center", py: 0.75 }}>
          <Typography
            sx={{ color: COLORS.muted, fontSize: 12, fontWeight: 700 }}
          >
            {isSmall ? day.charAt(0) : day}
          </Typography>
        </Box>
      ))}
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0.75,
      }}
    >
      {calendar.days.map((dayData, index) => (
        <CalendarDay
          key={`${dayData.day || "empty"}-${index}`}
          dayData={dayData}
        />
      ))}
    </Box>

    <Box
      sx={{
        mt: 3,
        pt: 2.25,
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        gap: 3,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 17,
            height: 17,
            borderRadius: "5px",
            bgcolor: alpha(COLORS.orange, 0.2),
            border: `1px solid ${COLORS.orange}`,
          }}
        />
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
          Match
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 17,
            height: 17,
            borderRadius: "5px",
            border: `2px solid ${COLORS.green}`,
          }}
        />
        <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
          Today
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default CalendarCard;
