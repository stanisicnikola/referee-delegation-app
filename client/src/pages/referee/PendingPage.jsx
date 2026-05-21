import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Check as AcceptIcon,
  Close as DeclineIcon,
  LocationOn as LocationIcon,
  SportsBasketball as BasketballIcon,
} from "@mui/icons-material";
import {
  useAcceptAssignment,
  useMyAssignments,
  useRejectAssignment,
} from "../../hooks";
import { getRefereeRoleBadge } from "../../utils/refereeAssignmentBadges";
import CustomButton from "../../components/ui/CustomButton";

const COLORS = {
  bg: "#0a0a0b",
  card: "#121214",
  cardHover: "#17171a",
  panel: "#1a1a1d",
  panelSoft: "rgba(255, 255, 255, 0.05)",
  border: "#242428",
  text: "#f8fafc",
  muted: "#6b7280",
  mutedStrong: "#9ca3af",
  orange: "#f97316",
  warning: "#eab308",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#60a5fa",
  purple: "#c084fc",
};

const declineReasons = [
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "health", label: "Health issue" },
  { value: "personal", label: "Personal reason" },
  { value: "travel", label: "Travel distance" },
  { value: "other", label: "Other" },
];

const getMatch = (assignment) => assignment?.match || assignment?.Match || null;

const getAssignmentMatchId = (assignment) =>
  assignment?.matchId || assignment?.match_id || getMatch(assignment)?.id;

const getScheduledDate = (match) => {
  const value = match?.scheduledAt || match?.matchDate || match?.date;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTeamName = (match, side) => {
  const key = side === "home" ? "homeTeam" : "awayTeam";
  const fallbackKey = side === "home" ? "HomeTeam" : "AwayTeam";

  return (
    match?.[key]?.name ||
    match?.[fallbackKey]?.name ||
    (side === "home" ? "Home team" : "Away team")
  );
};

const getCompetitionName = (match) =>
  match?.competition?.name || match?.Competition?.name || null;

const getVenueText = (match) => {
  const venue = match?.venue || match?.Venue;
  if (!venue) return "Venue not set";

  return [venue.name, venue.city].filter(Boolean).join(", ");
};

const getRefereeAssignments = (match) =>
  match?.refereeAssignments ||
  match?.RefereeAssignments ||
  match?.matchReferees ||
  [];

const getRefereeName = (assignment) => {
  const user =
    assignment?.referee?.user ||
    assignment?.referee?.User ||
    assignment?.Referee?.user ||
    assignment?.Referee?.User;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return name || "Colleague";
};

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getDelegateName = (match) => {
  const delegate = match?.delegate || match?.Delegate;
  const name = [delegate?.firstName, delegate?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || null;
};

const getRoleNumber = (role) => {
  const roleNumbers = {
    first_referee: "1",
    second_referee: "2",
    third_referee: "3",
    head: "1",
    main: "1",
    assistant: "A",
    second: "2",
    third: "3",
    fourth: "4",
  };

  return roleNumbers[role] || "R";
};

const getOtherReferees = (assignment) => {
  const currentRefereeId = assignment.refereeId || assignment.referee_id;

  return getRefereeAssignments(getMatch(assignment))
    .filter((matchAssignment) => {
      const refereeId = matchAssignment.refereeId || matchAssignment.referee_id;

      return (
        refereeId &&
        refereeId !== currentRefereeId &&
        matchAssignment.status !== "declined"
      );
    })
    .map((matchAssignment, index) => ({
      id:
        matchAssignment.refereeId ||
        matchAssignment.referee_id ||
        matchAssignment.id ||
        index,
      name: getRefereeName(matchAssignment),
      role: getRefereeRoleBadge(matchAssignment.role),
      badgeColor:
        index % 3 === 0
          ? COLORS.orange
          : index % 3 === 1
            ? "#22d3ee"
            : COLORS.purple,
    }));
};

const formatDate = (match) => {
  const date = getScheduledDate(match);

  if (!date) {
    return {
      day: "--",
      month: "---",
      weekday: "---",
      time: "--:--",
      full: "Date not set",
      displayDate: "-- --- ----",
    };
  }

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
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
    displayDate: date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
};

const PendingPage = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineNote, setDeclineNote] = useState("");

  const { data: assignmentsData, isLoading, refetch } = useMyAssignments();
  const acceptAssignment = useAcceptAssignment();
  const rejectAssignment = useRejectAssignment();

  const pendingDelegations = useMemo(() => {
    const assignments = assignmentsData?.data || [];

    return assignments
      .filter((assignment) => assignment.status === "pending")
      .sort((a, b) => {
        const dateA = getScheduledDate(getMatch(a))?.getTime() || 0;
        const dateB = getScheduledDate(getMatch(b))?.getTime() || 0;

        return dateA - dateB;
      });
  }, [assignmentsData?.data]);

  const isActionPending =
    acceptAssignment.isPending || rejectAssignment.isPending;

  const handleAccept = async (assignment) => {
    const matchId = getAssignmentMatchId(assignment);
    if (!matchId) return;

    try {
      await acceptAssignment.mutateAsync(matchId);
      await refetch();
    } catch {
      // Toast is handled by useAcceptAssignment.
    }
  };

  const handleDeclineClick = (assignment) => {
    setSelectedAssignment(assignment);
    setDeclineReason("");
    setDeclineNote("");
    setDeclineModalOpen(true);
  };

  const handleDeclineSubmit = async () => {
    const matchId = getAssignmentMatchId(selectedAssignment);
    if (!declineReason || !matchId) return;

    try {
      await rejectAssignment.mutateAsync({
        matchId,
        data: {
          reason: declineReason,
          notes: declineNote,
        },
      });
      setDeclineModalOpen(false);
      await refetch();
    } catch {
      // Toast is handled by useRejectAssignment.
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: COLORS.bg,
        }}
      >
        <CircularProgress sx={{ color: COLORS.green }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100%", bgcolor: COLORS.bg, color: COLORS.text }}>
      <Box
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2.5, md: 3 },
          maxWidth: 1800,
          mx: "auto",
        }}
      >
        <Box sx={{ mb: { xs: 2.5, md: 3.5 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "34px", sm: "40px", md: "48px" },
                fontWeight: 800,
                color: COLORS.text,
                lineHeight: 1.05,
              }}
            >
              Pending Delegations
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Review and respond to your pending match assignments
          </Typography>
        </Box>

        {pendingDelegations.length === 0 ? (
          <EmptyState />
        ) : (
          <Stack spacing={3} sx={{ maxWidth: 980, mx: "auto" }}>
            {pendingDelegations.map((assignment) => (
              <PendingCard
                key={assignment.id || getAssignmentMatchId(assignment)}
                assignment={assignment}
                isActionPending={isActionPending}
                onAccept={handleAccept}
                onDecline={handleDeclineClick}
              />
            ))}
          </Stack>
        )}
      </Box>

      <DeclineDialog
        fullScreen={isSmall}
        open={declineModalOpen}
        assignment={selectedAssignment}
        declineReason={declineReason}
        declineNote={declineNote}
        isSubmitting={rejectAssignment.isPending}
        onClose={() => setDeclineModalOpen(false)}
        onReasonChange={setDeclineReason}
        onNoteChange={setDeclineNote}
        onSubmit={handleDeclineSubmit}
      />
    </Box>
  );
};

const PendingCard = ({ assignment, isActionPending, onAccept, onDecline }) => {
  const match = getMatch(assignment);
  const dateInfo = formatDate(match);
  const role = getRefereeRoleBadge(assignment.role);
  const delegateName = getDelegateName(match);
  const otherReferees = getOtherReferees(assignment);
  const competitionName = getCompetitionName(match);
  const roundLabel = match?.round ? `Round ${match.round}` : null;
  const matchNumberLabel = match?.matchNumber
    ? `Match ${match.matchNumber}`
    : null;
  const detailChips = [competitionName, roundLabel, matchNumberLabel].filter(
    Boolean,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        bgcolor: COLORS.card,
        border: "1px solid rgba(234, 179, 8, 0.36)",
        p: { xs: 2.25, sm: 3, md: 3.5 },
        transition:
          "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease",
        "&:hover": {
          bgcolor: COLORS.cardHover,
          borderColor: "rgba(234, 179, 8, 0.55)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "82px minmax(0, 1fr)",
            sm: "98px minmax(0, 1fr)",
            md: "98px minmax(0, 1fr) auto",
          },
          gridTemplateAreas: {
            xs: `"date chips" "details details" "time time"`,
            sm: `"date content" "time content"`,
            md: `"date content time"`,
          },
          gap: { xs: 1.75, md: 2.5 },
          alignItems: "start",
        }}
      >
        <DateTile dateInfo={dateInfo} />

        <DetailChips chips={detailChips} mobile />

        <MatchHeaderInfo match={match} detailChips={detailChips} />

        <TimeBlock dateInfo={dateInfo} />
      </Box>

      <RolePanel
        role={role}
        roleNumber={getRoleNumber(assignment.role)}
        delegateName={delegateName}
      />

      {otherReferees.length > 0 && (
        <OtherRefereesSection referees={otherReferees} />
      )}

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        <Button
          variant='contained'
          startIcon={<DeclineIcon />}
          disabled={isActionPending}
          onClick={() => onDecline(assignment)}
          sx={{ ...declineButtonSx, ...pendingActionButtonSx }}
        >
          Decline
        </Button>
        <Button
          variant='contained'
          startIcon={<AcceptIcon />}
          disabled={isActionPending}
          onClick={() => onAccept(assignment)}
          sx={{ ...acceptButtonSx, ...pendingActionButtonSx }}
        >
          Accept
        </Button>
      </Box>
    </Paper>
  );
};

const DetailChips = ({ chips, mobile = false }) => {
  if (chips.length === 0) return null;

  return (
    <Box
      sx={{
        gridArea: mobile ? "chips" : "auto",
        display: {
          xs: mobile ? "flex" : "none",
          sm: mobile ? "none" : "flex",
        },
        alignItems: "center",
        alignSelf: "start",
        gap: 1,
        flexWrap: "wrap",
        mb: mobile ? 0 : 1.2,
        minWidth: 0,
      }}
    >
      {chips.map((label, index) => (
        <TinyChip
          key={label}
          label={label}
          color={index === 0 ? COLORS.blue : COLORS.mutedStrong}
          bg={
            index === 0
              ? "rgba(96, 165, 250, 0.15)"
              : "rgba(255, 255, 255, 0.08)"
          }
        />
      ))}
    </Box>
  );
};

const MatchHeaderInfo = ({ match, detailChips }) => (
  <Box
    sx={{
      gridArea: { xs: "details", sm: "content" },
      minWidth: 0,
    }}
  >
    <DetailChips chips={detailChips} />

    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: "1.2rem", md: "1.35rem" },
        lineHeight: 1.25,
        fontWeight: 900,
        overflowWrap: "anywhere",
      }}
    >
      {getTeamName(match, "home")} vs {getTeamName(match, "away")}
    </Typography>

    <Box
      sx={{
        mt: 1.2,
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        flexWrap: "wrap",
        color: COLORS.mutedStrong,
      }}
    >
      <MetaItem icon={<LocationIcon />} label={getVenueText(match)} />
    </Box>
  </Box>
);

const TimeBlock = ({ dateInfo }) => (
  <Box
    sx={{
      gridArea: "time",
      justifySelf: { xs: "start", md: "end" },
      textAlign: { xs: "left", md: "right" },
      minWidth: { md: 128 },
    }}
  >
    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: 30, md: 34 },
        lineHeight: 1,
        fontWeight: 900,
      }}
    >
      {dateInfo.time}
    </Typography>
    <Typography
      sx={{
        mt: 1,
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {dateInfo.displayDate}
    </Typography>
  </Box>
);

const RolePanel = ({ role, roleNumber, delegateName }) => (
  <Box
    sx={{
      p: { xs: 2, md: 2.25 },
      borderRadius: "16px",
      bgcolor: COLORS.panel,
    }}
  >
    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: 14,
        fontWeight: 850,
        mb: 1.75,
      }}
    >
      Your role on this match:
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 58,
          height: 58,
          borderRadius: "14px",
          bgcolor: "rgba(255, 255, 255, 0.06)",
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 25,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {roleNumber}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <TinyChip label={role.label} color={role.color} bg={role.bg} />
        {delegateName && (
          <Typography
            sx={{
              mt: 0.7,
              color: COLORS.muted,
              fontSize: 14,
              fontWeight: 750,
              overflowWrap: "anywhere",
            }}
          >
            Assigned by: {delegateName} (Delegate)
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

const OtherRefereesSection = ({ referees }) => (
  <Box sx={{ mt: 2.75 }}>
    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: 14,
        fontWeight: 850,
        mb: 1.25,
      }}
    >
      Other referees:
    </Typography>
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        flexWrap: "wrap",
      }}
    >
      {referees.map((referee) => (
        <RefereeMiniCard key={referee.id} referee={referee} />
      ))}
    </Box>
  </Box>
);

const RefereeMiniCard = ({ referee }) => (
  <Box
    sx={{
      minWidth: { xs: "100%", sm: 210 },
      maxWidth: { sm: 250 },
      px: 1.5,
      py: 1.25,
      borderRadius: "10px",
      bgcolor: "rgba(255, 255, 255, 0.04)",
      display: "flex",
      alignItems: "center",
      gap: 1.2,
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        bgcolor: referee.badgeColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {getInitials(referee.name)}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: COLORS.text,
          fontSize: 14,
          fontWeight: 900,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {referee.name}
      </Typography>
      <Typography
        sx={{
          color: COLORS.muted,
          fontSize: 12,
          fontWeight: 750,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {referee.role.label}
      </Typography>
    </Box>
  </Box>
);

const DateTile = ({ dateInfo }) => (
  <Box
    sx={{
      gridArea: "date",
      width: { xs: 82, sm: 98 },
      minHeight: { xs: 88, sm: 98 },
      borderRadius: "16px",
      bgcolor: "rgba(234, 179, 8, 0.12)",
      border: "1px solid rgba(234, 179, 8, 0.24)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.35,
      px: 1,
      py: { xs: 1.1, sm: 1.5 },
      textAlign: "center",
    }}
  >
    <Typography
      sx={{
        color: COLORS.warning,
        fontSize: 12,
        fontWeight: 850,
        lineHeight: 1,
        textTransform: "uppercase",
      }}
    >
      {dateInfo.weekday}
    </Typography>
    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: 34, sm: 36 },
        lineHeight: 1,
        fontWeight: 900,
        mt: 0.65,
      }}
    >
      {dateInfo.day}
    </Typography>
  </Box>
);

const MetaItem = ({ icon, label }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.6,
      minWidth: 0,
      maxWidth: { xs: "100%", lg: 380 },
    }}
  >
    <Box
      component='span'
      sx={{
        display: "inline-flex",
        color: COLORS.muted,
        "& .MuiSvgIcon-root": { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography
      component='span'
      sx={{
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: 650,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: { xs: "normal", sm: "nowrap" },
      }}
    >
      {label}
    </Typography>
  </Box>
);

const TinyChip = ({
  label,
  color = COLORS.mutedStrong,
  bg = "rgba(255, 255, 255, 0.08)",
}) => (
  <Chip
    size='small'
    label={label}
    sx={{
      height: 28,
      borderRadius: "8px",
      bgcolor: bg,
      color,
      fontSize: 12,
      fontWeight: 850,
      maxWidth: { xs: "100%", sm: 220 },
      "& .MuiChip-label": {
        px: 1.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }}
  />
);

const EmptyState = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 4, md: 6 },
      borderRadius: "18px",
      bgcolor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      textAlign: "center",
    }}
  >
    <BasketballIcon sx={{ fontSize: 58, color: COLORS.muted, mb: 1.5 }} />
    <Typography sx={{ color: COLORS.text, fontWeight: 850, fontSize: 18 }}>
      No pending delegations
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mt: 0.75 }}>
      You&apos;re all caught up. New assignments will appear here.
    </Typography>
  </Paper>
);

const DeclineDialog = ({
  fullScreen,
  open,
  assignment,
  declineReason,
  declineNote,
  isSubmitting,
  onClose,
  onReasonChange,
  onNoteChange,
  onSubmit,
}) => {
  const match = getMatch(assignment);
  const dateInfo = formatDate(match);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: COLORS.card,
          backgroundImage: "none",
          border: `1px solid ${COLORS.border}`,
          borderRadius: fullScreen ? 0 : "16px",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: COLORS.text,
          fontWeight: 850,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        Decline Delegation
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {assignment && (
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography sx={{ color: COLORS.mutedStrong, fontSize: 14, mb: 1 }}>
              You are declining this assignment:
            </Typography>
            <Typography sx={{ color: COLORS.text, fontWeight: 800 }}>
              {getTeamName(match, "home")} vs {getTeamName(match, "away")}
            </Typography>
            <Typography sx={{ color: COLORS.muted, fontSize: 14, mt: 0.5 }}>
              {dateInfo.full}
            </Typography>
          </Box>
        )}

        <Stack spacing={3}>
          <FormControl fullWidth required>
            <InputLabel
              sx={{
                color: COLORS.mutedStrong,
                "&.Mui-focused": { color: COLORS.mutedStrong },
              }}
            >
              Reason for declining
            </InputLabel>
            <Select
              value={declineReason}
              onChange={(event) => onReasonChange(event.target.value)}
              label='Reason for declining'
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: COLORS.panel,
                    border: `1px solid ${COLORS.border}`,
                  },
                },
              }}
              sx={selectSx}
            >
              {declineReasons.map((reason) => (
                <MenuItem key={reason.value} value={reason.value}>
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
            onChange={(event) => onNoteChange(event.target.value)}
            fullWidth
            placeholder='Add any useful context...'
            sx={textFieldSx}
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${COLORS.border}`,
          gap: 1,
        }}
      >
        <Button onClick={onClose} sx={dialogCancelButtonSx}>
          Cancel
        </Button>
        <CustomButton
          onClick={onSubmit}
          variant='danger'
          disabled={!declineReason || isSubmitting}
        >
          {isSubmitting ? "Declining..." : "Decline Assignment"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

const acceptButtonSx = {
  px: 1.85,
  py: 0.95,
  borderRadius: "10px",
  background: COLORS.border,
  color: COLORS.text,
  boxShadow: "none",
  fontSize: 13,
  fontWeight: 850,
  whiteSpace: "nowrap",
  "&:hover": {
    background: "rgba(48, 227, 66, 0.26)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    background: "rgba(255, 255, 255, 0.08)",
    color: COLORS.muted,
  },
  "& .MuiButton-startIcon": { color: COLORS.green },
};

const declineButtonSx = {
  px: 1.85,
  py: 0.95,
  borderRadius: "10px",
  background: "rgba(239, 68, 68, 0.16)",
  color: "#fca5a5",
  boxShadow: "none",
  fontSize: 13,
  fontWeight: 850,
  whiteSpace: "nowrap",
  "&:hover": {
    background: "rgba(239, 68, 68, 0.24)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    background: "rgba(255, 255, 255, 0.08)",
    color: COLORS.muted,
  },
  "& .MuiButton-startIcon": { color: COLORS.red },
};

const pendingActionButtonSx = {
  minHeight: 56,
  fontSize: 15,
  borderRadius: "12px",
};

const selectSx = {
  color: COLORS.text,
  borderRadius: "12px",
  backgroundColor: COLORS.panel,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.34)",
    borderWidth: "1px",
  },
  "& .MuiSvgIcon-root": { color: COLORS.mutedStrong },
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: COLORS.text,
    borderRadius: "12px",
    backgroundColor: COLORS.panel,
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.14)" },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.24)" },
    "&.Mui-focused": { boxShadow: "none" },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(255, 255, 255, 0.34)",
      borderWidth: "1px",
    },
  },
  "& .MuiInputLabel-root": { color: COLORS.mutedStrong },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.mutedStrong },
};

const dialogCancelButtonSx = {
  color: COLORS.mutedStrong,
  fontWeight: 800,
  "&:hover": { bgcolor: COLORS.panelSoft },
};

export default PendingPage;
