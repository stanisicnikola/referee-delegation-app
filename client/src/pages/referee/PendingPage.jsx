import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  CheckCircle as AcceptIcon,
  Cancel as DeclineIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  SportsSoccer as SoccerIcon,
} from "@mui/icons-material";
import {
  useMyAssignments,
  useConfirmAssignment,
  useRejectAssignment,
} from "../../hooks";

// Orange accent for referee panel
const ACCENT_COLOR = "#f97316";

const PendingPage = () => {
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineNote, setDeclineNote] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data - use assignments instead of delegations (referee endpoint)
  const { data: assignmentsData, isLoading, refetch } = useMyAssignments();

  // Mutations
  const confirmAssignment = useConfirmAssignment();
  const rejectAssignment = useRejectAssignment();

  // Filter pending delegations only
  const pendingDelegations = useMemo(() => {
    const assignments = assignmentsData?.data || [];
    return assignments
      .filter((a) => a.status === "pending")
      .sort((a, b) => {
        const dateA = new Date(a.match?.scheduledAt || a.match?.matchDate || 0);
        const dateB = new Date(b.match?.scheduledAt || b.match?.matchDate || 0);
        return dateA - dateB;
      });
  }, [assignmentsData]);

  const declineReasons = [
    { value: "schedule_conflict", label: "Schedule Conflict" },
    { value: "health", label: "Health Issues" },
    { value: "personal", label: "Personal Reasons" },
    { value: "travel", label: "Travel Distance" },
    { value: "other", label: "Other" },
  ];

  const formatDate = (dateString) => {
    if (!dateString)
      return { day: "-", month: "-", weekday: "-", time: "-", full: "-" };
    const date = new Date(dateString);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      weekday: weekdays[date.getDay()],
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      full: date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      head: { label: "Head Referee", color: "#22c55e" },
      main: { label: "Head Referee", color: "#22c55e" },
      assistant: { label: "Assistant", color: "#3b82f6" },
      second: { label: "2nd Referee", color: "#3b82f6" },
      third: { label: "3rd Referee", color: "#8b5cf6" },
      fourth: { label: "4th Official", color: "#ec4899" },
    };
    return roleMap[role] || { label: role || "Referee", color: "grey" };
  };

  const handleAccept = async (delegation) => {
    try {
      await confirmAssignment.mutateAsync(delegation.matchId);
      setSnackbar({
        open: true,
        message: "Delegation accepted successfully!",
        severity: "success",
      });
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to accept delegation. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDeclineClick = (delegation) => {
    setSelectedMatch(delegation);
    setDeclineReason("");
    setDeclineNote("");
    setDeclineModalOpen(true);
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason) return;

    try {
      await rejectAssignment.mutateAsync({
        matchId: selectedMatch.matchId,
        data: {
          reason: declineReason,
          notes: declineNote,
        },
      });
      setDeclineModalOpen(false);
      setSnackbar({
        open: true,
        message: "Delegation declined.",
        severity: "info",
      });
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to decline delegation. Please try again.",
        severity: "error",
      });
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "white",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&.Mui-focused fieldset": { borderColor: ACCENT_COLOR },
    },
    "& .MuiInputLabel-root": { color: "grey.400" },
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: ACCENT_COLOR }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Typography variant='h5' fontWeight={600} color='white'>
            Pending Delegations
          </Typography>
          {pendingDelegations.length > 0 && (
            <Chip
              size='small'
              label={pendingDelegations.length}
              sx={{
                bgcolor: ACCENT_COLOR,
                color: "white",
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        <Typography variant='body2' color='grey.400'>
          Review and respond to your pending match assignments
        </Typography>
      </Box>

      {/* Pending List */}
      {pendingDelegations.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <SoccerIcon sx={{ fontSize: 64, color: "grey.600", mb: 2 }} />
          <Typography variant='h6' color='grey.400' gutterBottom>
            No pending delegations
          </Typography>
          <Typography variant='body2' color='grey.500'>
            You&apos;re all caught up! Check back later for new assignments.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {pendingDelegations.map((delegation) => {
            const match = delegation.match;
            const dateInfo = formatDate(match?.scheduledAt);
            const roleBadge = getRoleBadge(delegation.role);

            return (
              <Paper
                key={delegation.id}
                sx={{
                  p: 3,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Pending indicator */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 4,
                    height: "100%",
                    bgcolor: ACCENT_COLOR,
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  {/* Date Box */}
                  <Box
                    sx={{
                      minWidth: 80,
                      textAlign: "center",
                      bgcolor: "rgba(249, 115, 22, 0.1)",
                      borderRadius: 2,
                      p: 2,
                      border: `1px solid ${ACCENT_COLOR}30`,
                      alignSelf: { xs: "flex-start", md: "center" },
                    }}
                  >
                    <Typography
                      variant='caption'
                      color={ACCENT_COLOR}
                      fontWeight={500}
                    >
                      {dateInfo.month}
                    </Typography>
                    <Typography variant='h3' color='white' fontWeight={700}>
                      {dateInfo.day}
                    </Typography>
                    <Typography variant='caption' color='grey.500'>
                      {dateInfo.weekday.slice(0, 3)}
                    </Typography>
                  </Box>

                  {/* Match Info */}
                  <Box sx={{ flex: 1 }}>
                    {/* Teams */}
                    <Typography
                      variant='h6'
                      color='white'
                      fontWeight={600}
                      gutterBottom
                    >
                      {match?.homeTeam?.name || "TBD"} vs{" "}
                      {match?.awayTeam?.name || "TBD"}
                    </Typography>

                    {/* Details */}
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <TimeIcon sx={{ fontSize: 18, color: "grey.500" }} />
                        <Typography variant='body2' color='grey.400'>
                          {dateInfo.time}
                        </Typography>
                      </Box>
                      {match?.venue && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <LocationIcon
                            sx={{ fontSize: 18, color: "grey.500" }}
                          />
                          <Typography variant='body2' color='grey.400'>
                            {match.venue.name}
                          </Typography>
                        </Box>
                      )}
                      {match?.competition && (
                        <Chip
                          size='small'
                          label={match.competition.name}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.05)",
                            color: "grey.400",
                          }}
                        />
                      )}
                    </Box>

                    {/* Your Role */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant='body2' color='grey.500'>
                        Your Role:
                      </Typography>
                      <Chip
                        label={roleBadge.label}
                        sx={{
                          bgcolor: `${roleBadge.color}20`,
                          color: roleBadge.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Warning */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1.5,
                        bgcolor: "rgba(249, 115, 22, 0.1)",
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <WarningIcon sx={{ fontSize: 20, color: ACCENT_COLOR }} />
                      <Typography variant='body2' color='grey.300'>
                        Please respond to this delegation as soon as possible
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "row", md: "column" },
                      gap: 1.5,
                      alignSelf: { xs: "stretch", md: "center" },
                      minWidth: { md: 140 },
                    }}
                  >
                    <Button
                      variant='contained'
                      startIcon={<AcceptIcon />}
                      onClick={() => handleAccept(delegation)}
                      disabled={confirmAssignment.isPending}
                      fullWidth
                      sx={{
                        bgcolor: "#22c55e",
                        "&:hover": { bgcolor: "#16a34a" },
                        py: 1.5,
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant='outlined'
                      startIcon={<DeclineIcon />}
                      onClick={() => handleDeclineClick(delegation)}
                      disabled={rejectAssignment.isPending}
                      fullWidth
                      sx={{
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        "&:hover": {
                          borderColor: "#ef4444",
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                        },
                        py: 1.5,
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Decline Modal */}
      <Dialog
        open={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        maxWidth='sm'
        fullWidth
        fullScreen={isSmall}
        PaperProps={{
          sx: {
            bgcolor: "#1a1a2e",
            backgroundImage: "none",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Decline Delegation
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedMatch && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='grey.400' gutterBottom>
                You are declining the assignment for:
              </Typography>
              <Typography variant='h6' color='white'>
                {selectedMatch.match?.homeTeam?.name} vs{" "}
                {selectedMatch.match?.awayTeam?.name}
              </Typography>
              <Typography variant='body2' color='grey.500'>
                {formatDate(selectedMatch.match?.scheduledAt).full}
              </Typography>
            </Box>
          )}

          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "grey.400" }}>
                Reason for declining
              </InputLabel>
              <Select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                label='Reason for declining'
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: ACCENT_COLOR,
                  },
                  "& .MuiSvgIcon-root": { color: "grey.400" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                    },
                  },
                }}
              >
                {declineReasons.map((reason) => (
                  <MenuItem
                    key={reason.value}
                    value={reason.value}
                    sx={{ color: "white" }}
                  >
                    {reason.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label='Additional notes (optional)'
              multiline
              rows={3}
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              fullWidth
              placeholder='Any additional information...'
              sx={inputStyles}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Button
            onClick={() => setDeclineModalOpen(false)}
            sx={{ color: "grey.400" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeclineSubmit}
            variant='contained'
            disabled={!declineReason || rejectAssignment.isPending}
            sx={{
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
              "&.Mui-disabled": { bgcolor: "grey.700" },
            }}
          >
            {rejectAssignment.isPending ? "Declining..." : "Confirm Decline"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingPage;
