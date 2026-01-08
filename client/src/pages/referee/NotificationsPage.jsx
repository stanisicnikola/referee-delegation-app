import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Assignment as DelegationIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  SportsSoccer as SoccerIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { useMyAssignments } from "../../hooks";
import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { hr } from "date-fns/locale";

// Orange accent for referee panel
const ACCENT_COLOR = "#f97316";

const NotificationsPage = () => {
  // Fetch assignments only (contains all delegation info for referee)
  const { data: assignmentsData, isLoading, error } = useMyAssignments();

  // Generate notifications from assignments data
  const notifications = useMemo(() => {
    const items = [];
    const assignments = assignmentsData?.data || [];

    // Generate notifications from assignments based on status
    assignments.forEach((assignment) => {
      const match = assignment.match || assignment.Match;
      if (!match) return;

      const matchDate = match.matchDate || match.scheduledAt || match.date;
      const homeTeam =
        match.homeTeam?.name || match.HomeTeam?.name || "Domaćin";
      const awayTeam = match.awayTeam?.name || match.AwayTeam?.name || "Gost";
      const competition =
        match.competition?.name || match.Competition?.name || "";

      const createdAt = assignment.createdAt
        ? parseISO(assignment.createdAt)
        : new Date();

      if (assignment.status === "pending") {
        items.push({
          id: `del-pending-${assignment.id}`,
          type: "delegation",
          title: "Nova delegacija",
          message: `Dodijeljeni ste kao ${getRoleName(
            assignment.role
          )} za utakmicu ${homeTeam} - ${awayTeam}${
            competition ? ` (${competition})` : ""
          }`,
          time: createdAt,
          read: false,
          icon: DelegationIcon,
          color: ACCENT_COLOR,
          matchDate,
        });
      } else if (assignment.status === "confirmed") {
        items.push({
          id: `del-confirmed-${assignment.id}`,
          type: "confirmation",
          title: "Delegacija potvrđena",
          message: `Vaša delegacija za utakmicu ${homeTeam} - ${awayTeam} je potvrđena`,
          time: assignment.updatedAt
            ? parseISO(assignment.updatedAt)
            : createdAt,
          read: true,
          icon: CheckIcon,
          color: "#22c55e",
          matchDate,
        });
      } else if (assignment.status === "rejected") {
        items.push({
          id: `del-rejected-${assignment.id}`,
          type: "rejected",
          title: "Delegacija odbijena",
          message: `Odbili ste delegaciju za utakmicu ${homeTeam} - ${awayTeam}`,
          time: assignment.updatedAt
            ? parseISO(assignment.updatedAt)
            : createdAt,
          read: true,
          icon: CancelIcon,
          color: "#ef4444",
          matchDate,
        });
      }

      // Also add reminders for upcoming confirmed matches
      if (assignment.status === "confirmed" && matchDate) {
        const matchDateTime = parseISO(matchDate);
        const now = new Date();
        const daysUntilMatch = Math.ceil(
          (matchDateTime - now) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilMatch > 0 && daysUntilMatch <= 3) {
          items.push({
            id: `reminder-${assignment.matchId || assignment.id}`,
            type: "reminder",
            title: "Podsjetnik za utakmicu",
            message: `Imate utakmicu ${homeTeam} - ${awayTeam} za ${daysUntilMatch} ${
              daysUntilMatch === 1 ? "dan" : "dana"
            }`,
            time: new Date(),
            read: daysUntilMatch > 1,
            icon: EventIcon,
            color: "#3b82f6",
            matchDate,
          });
        }
      }
    });

    // Sort by time (newest first)
    items.sort((a, b) => b.time - a.time);

    return items;
  }, [assignmentsData]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    notifications.forEach((notification) => {
      if (isToday(notification.time)) {
        today.push(notification);
      } else if (isYesterday(notification.time)) {
        yesterday.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    return { today, yesterday, earlier };
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const NotificationItem = ({ notification }) => {
    const IconComponent = notification.icon;
    return (
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          bgcolor: notification.read
            ? "transparent"
            : "rgba(249, 115, 22, 0.05)",
          borderRadius: 2,
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.05)",
          },
          position: "relative",
        }}
      >
        {/* Unread indicator */}
        {!notification.read && (
          <Box
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: ACCENT_COLOR,
            }}
          />
        )}

        {/* Icon */}
        <Avatar
          sx={{
            bgcolor: `${notification.color}20`,
            color: notification.color,
            width: 44,
            height: 44,
            ml: notification.read ? 0 : 1,
          }}
        >
          <IconComponent />
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: notification.read ? 500 : 600,
                color: notification.read ? "text.primary" : "text.primary",
              }}
            >
              {notification.title}
            </Typography>
            <Chip
              label={getNotificationTypeLabel(notification.type)}
              size='small'
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor: `${notification.color}15`,
                color: notification.color,
                fontWeight: 500,
              }}
            />
          </Box>
          <Typography
            variant='body2'
            sx={{
              color: "text.secondary",
              mb: 0.5,
              lineHeight: 1.5,
            }}
          >
            {notification.message}
          </Typography>
          <Typography variant='caption' color='text.disabled'>
            {formatNotificationTime(notification.time)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const NotificationGroup = ({ title, notifications: groupNotifications }) => {
    if (groupNotifications.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography
          variant='subtitle2'
          sx={{
            color: "text.secondary",
            mb: 1.5,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>
        <Paper
          sx={{
            overflow: "hidden",
            "& > *:not(:last-child)": {
              borderBottom: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {groupNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </Paper>
      </Box>
    );
  };

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
          Greška pri učitavanju obavijesti: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Obavijesti
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {unreadCount > 0
              ? `Imate ${unreadCount} nepročitanih obavijesti`
              : "Sve obavijesti su pročitane"}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Chip
            label={unreadCount}
            size='small'
            sx={{
              bgcolor: ACCENT_COLOR,
              color: "white",
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Empty state */}
      {notifications.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <SoccerIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant='h6' color='text.secondary' gutterBottom>
            Nema obavijesti
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            Obavijesti o delegacijama i utakmicama će se pojaviti ovdje
          </Typography>
        </Paper>
      )}

      {/* Notification Groups */}
      <NotificationGroup
        title='Danas'
        notifications={groupedNotifications.today}
      />
      <NotificationGroup
        title='Jučer'
        notifications={groupedNotifications.yesterday}
      />
      <NotificationGroup
        title='Ranije'
        notifications={groupedNotifications.earlier}
      />
    </Box>
  );
};

// Helper functions
function getRoleName(role) {
  const roles = {
    head_referee: "Glavni sudac",
    first_assistant: "1. pomoćni sudac",
    second_assistant: "2. pomoćni sudac",
    fourth_official: "4. službenik",
    var_referee: "VAR sudac",
    avar_referee: "AVAR sudac",
    delegate: "Delegat",
    observer: "Nadzornik",
  };
  return roles[role] || role;
}

function getNotificationTypeLabel(type) {
  const labels = {
    delegation: "Delegacija",
    confirmation: "Potvrđeno",
    reminder: "Podsjetnik",
    rejected: "Odbijeno",
    cancelled: "Otkazano",
    info: "Info",
  };
  return labels[type] || type;
}

function formatNotificationTime(date) {
  if (isToday(date)) {
    return `Danas u ${format(date, "HH:mm")}`;
  }
  if (isYesterday(date)) {
    return `Jučer u ${format(date, "HH:mm")}`;
  }
  return formatDistanceToNow(date, { addSuffix: true, locale: hr });
}

export default NotificationsPage;
