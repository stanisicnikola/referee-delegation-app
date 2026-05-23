import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { WEEKDAY_SHORT_NAMES_MONDAY_FIRST } from "../../../constants/date";
import { DASHBOARD_COLORS as COLORS } from "./constants";

const calendarButtonSx = {
  color: COLORS.mutedStrong,
  borderRadius: "8px",
  "&:hover": {
    color: COLORS.text,
    bgcolor: "rgba(255, 255, 255, 0.06)",
  },
};

const CalendarDay = ({ dayData }) => {
  if (dayData.type === "empty") {
    return <Box sx={{ minHeight: { xs: 34, sm: 42 } }} />;
  }

  const isMatch = dayData.type === "match";

  return (
    <Tooltip title={isMatch ? "Match scheduled" : ""} arrow disableInteractive>
      <Box
        sx={{
          minHeight: { xs: 34, sm: 42 },
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: isMatch ? COLORS.orange : COLORS.text,
          bgcolor: isMatch ? "rgba(249, 115, 22, 0.14)" : "transparent",
          border: dayData.isToday
            ? `2px solid ${COLORS.green}`
            : isMatch
              ? "1px solid rgba(249, 115, 22, 0.28)"
              : "1px solid transparent",
          fontWeight: dayData.isToday || isMatch ? 800 : 600,
          cursor: isMatch ? "pointer" : "default",
          transition: "background-color 0.16s ease, border-color 0.16s ease",
          "&:hover": {
            bgcolor: isMatch
              ? "rgba(249, 115, 22, 0.2)"
              : "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: "inherit" }}>
          {dayData.day}
        </Typography>
        {isMatch && (
          <Box
            sx={{
              position: "absolute",
              bottom: 5,
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: COLORS.orange,
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

const LegendDot = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: color,
      }}
    />
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
      {label}
    </Typography>
  </Box>
);

const CalendarCard = ({ calendar, isSmall, onPrev, onNext }) => (
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
      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
        {calendar.monthLabel}
      </Typography>
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
      <LegendDot color={COLORS.orange} label='Match' />
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
