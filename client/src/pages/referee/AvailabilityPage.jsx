import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  EventBusy as EventBusyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  useMyCalendar,
  useSetMyAvailability,
} from "../../hooks/useAvailability";
import { useSnackbar } from "notistack";

const DAYS_OF_WEEK = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
const MONTHS = [
  "Siječanj",
  "Veljača",
  "Ožujak",
  "Travanj",
  "Svibanj",
  "Lipanj",
  "Srpanj",
  "Kolovoz",
  "Rujan",
  "Listopad",
  "Studeni",
  "Prosinac",
];

const AvailabilityPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // API hooks
  const {
    data: calendarData,
    isLoading,
    error,
  } = useMyCalendar({ year, month });

  const setAvailabilityMutation = useSetMyAvailability();

  // Create calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday

    const grid = [];
    let day = 1;

    // Create 6 rows for the calendar
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDay) || day > daysInMonth) {
          week.push(null);
        } else {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const calendarItem = calendarData?.calendar?.find(
            (c) => c.date === dateStr
          );

          week.push({
            day,
            date: dateStr,
            isAvailable: calendarItem?.isAvailable ?? true,
            reason: calendarItem?.reason || null,
            isToday: dateStr === new Date().toISOString().split("T")[0],
            isPast:
              new Date(dateStr) <
              new Date(new Date().toISOString().split("T")[0]),
          });
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }

    return grid;
  }, [year, month, calendarData]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle day click
  const handleDayClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast) return;

    setSelectedDate(dayInfo);
    setReason(dayInfo.reason || "");
    setDialogOpen(true);
  };

  // Handle availability toggle
  const handleToggleAvailability = async (makeAvailable) => {
    if (!selectedDate) return;

    try {
      await setAvailabilityMutation.mutateAsync({
        date: selectedDate.date,
        isAvailable: makeAvailable,
        reason: makeAvailable ? null : reason || null,
      });

      enqueueSnackbar(
        makeAvailable
          ? "Označeni ste kao dostupni za taj datum"
          : "Označeni ste kao nedostupni za taj datum",
        { variant: "success" }
      );
      setDialogOpen(false);
      setSelectedDate(null);
      setReason("");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Greška pri ažuriranju dostupnosti",
        { variant: "error" }
      );
    }
  };

  // Count unavailable days this month
  const unavailableDays = useMemo(() => {
    if (!calendarData?.calendar) return 0;
    return calendarData.calendar.filter((d) => !d.isAvailable).length;
  }, [calendarData]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          Greška pri učitavanju kalendara: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
          Moja dostupnost
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Označite dane kada niste dostupni za suđenje
        </Typography>
      </Box>

      {/* Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={<EventBusyIcon />}
            label={`${unavailableDays} nedostupnih dana ovaj mjesec`}
            color={unavailableDays > 0 ? "warning" : "default"}
            variant='outlined'
          />
          <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 0.5,
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  border: `1px solid ${theme.palette.success.main}`,
                }}
              />
              <Typography variant='caption'>Dostupan</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 0.5,
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  border: `1px solid ${theme.palette.error.main}`,
                }}
              />
              <Typography variant='caption'>Nedostupan</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Calendar */}
      <Paper sx={{ p: 3 }}>
        {/* Calendar Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={goToPreviousMonth} size='small'>
              <ChevronLeftIcon />
            </IconButton>
            <Typography
              variant='h5'
              sx={{ minWidth: 200, textAlign: "center", fontWeight: 500 }}
            >
              {MONTHS[month - 1]} {year}
            </Typography>
            <IconButton onClick={goToNextMonth} size='small'>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Button
            startIcon={<TodayIcon />}
            onClick={goToToday}
            variant='outlined'
            size='small'
          >
            Danas
          </Button>
        </Box>

        {/* Days of Week Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            mb: 1,
          }}
        >
          {DAYS_OF_WEEK.map((day, index) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 1,
                fontWeight: 600,
                color: index === 0 ? "error.main" : "text.secondary",
              }}
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Calendar Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
          }}
        >
          {calendarGrid.map((week, weekIndex) =>
            week.map((dayInfo, dayIndex) => (
              <Tooltip
                key={`${weekIndex}-${dayIndex}`}
                title={
                  dayInfo?.reason
                    ? `Razlog: ${dayInfo.reason}`
                    : dayInfo?.isPast
                    ? "Prošli datum"
                    : dayInfo?.isAvailable
                    ? "Dostupan - kliknite za promjenu"
                    : "Nedostupan - kliknite za promjenu"
                }
                arrow
                disableHoverListener={!dayInfo}
              >
                <Box
                  onClick={() => handleDayClick(dayInfo)}
                  sx={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    cursor: dayInfo && !dayInfo.isPast ? "pointer" : "default",
                    transition: "all 0.2s",
                    position: "relative",
                    bgcolor: dayInfo
                      ? dayInfo.isPast
                        ? "action.disabledBackground"
                        : dayInfo.isAvailable
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.error.main, 0.15)
                      : "transparent",
                    border: dayInfo?.isToday
                      ? `2px solid ${theme.palette.primary.main}`
                      : "1px solid",
                    borderColor: dayInfo
                      ? dayInfo.isPast
                        ? "divider"
                        : dayInfo.isAvailable
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.error.main, 0.4)
                      : "transparent",
                    "&:hover":
                      dayInfo && !dayInfo.isPast
                        ? {
                            bgcolor: dayInfo.isAvailable
                              ? alpha(theme.palette.success.main, 0.2)
                              : alpha(theme.palette.error.main, 0.25),
                            transform: "scale(1.02)",
                          }
                        : {},
                    opacity: dayInfo?.isPast ? 0.5 : 1,
                  }}
                >
                  {dayInfo && (
                    <>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: dayInfo.isToday ? 700 : 400,
                          color: dayInfo.isPast
                            ? "text.disabled"
                            : dayInfo.isAvailable
                            ? "success.dark"
                            : "error.dark",
                        }}
                      >
                        {dayInfo.day}
                      </Typography>
                      {!dayInfo.isAvailable && !dayInfo.isPast && (
                        <CloseIcon
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            fontSize: 12,
                            color: "error.main",
                          }}
                        />
                      )}
                    </>
                  )}
                </Box>
              </Tooltip>
            ))
          )}
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>
          Uredi dostupnost za {selectedDate?.day}. {MONTHS[month - 1]}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Trenutno ste označeni kao:{" "}
              <strong
                style={{
                  color: selectedDate?.isAvailable
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                }}
              >
                {selectedDate?.isAvailable ? "DOSTUPAN" : "NEDOSTUPAN"}
              </strong>
            </Typography>

            {!selectedDate?.isAvailable && selectedDate?.reason && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Razlog: {selectedDate.reason}
              </Alert>
            )}

            <TextField
              fullWidth
              label='Razlog nedostupnosti (opcionalno)'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='npr. Godišnji odmor, Posao...'
              multiline
              rows={2}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} color='inherit'>
            Odustani
          </Button>
          {selectedDate?.isAvailable ? (
            <Button
              onClick={() => handleToggleAvailability(false)}
              variant='contained'
              color='error'
              startIcon={<CloseIcon />}
              disabled={setAvailabilityMutation.isPending}
            >
              {setAvailabilityMutation.isPending
                ? "Spremanje..."
                : "Označi nedostupnim"}
            </Button>
          ) : (
            <Button
              onClick={() => handleToggleAvailability(true)}
              variant='contained'
              color='success'
              startIcon={<CheckIcon />}
              disabled={setAvailabilityMutation.isPending}
            >
              {setAvailabilityMutation.isPending
                ? "Spremanje..."
                : "Označi dostupnim"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvailabilityPage;
