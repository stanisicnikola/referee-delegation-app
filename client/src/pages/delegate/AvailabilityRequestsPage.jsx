import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Check as AcceptIcon,
  CheckCircle as CheckCircleIcon,
  Close as DeclineIcon,
  EventBusy as EventBusyIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import {
  useAvailabilityRequests,
  useReviewAvailabilityRequests,
} from "../../hooks/useAvailability";

const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_META = {
  pending: {
    label: "Pending approval",
    color: "#f59e0b",
    icon: AccessTimeIcon,
  },
  approved: {
    label: "Approved",
    color: "#22c55e",
    icon: CheckCircleIcon,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    icon: WarningAmberIcon,
  },
};

const approveButtonSx = {
  px: 1.85,
  py: 0.95,
  minHeight: 56,
  borderRadius: "12px",
  background: "#242428",
  color: "#f8fafc",
  boxShadow: "none",
  fontSize: 15,
  fontWeight: 850,
  whiteSpace: "nowrap",
  textTransform: "none",
  "&:hover": {
    background: "rgba(48, 227, 66, 0.26)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#6b7280",
  },
  "& .MuiButton-startIcon": { color: "#22c55e" },
};

const rejectButtonSx = {
  px: 1.85,
  py: 0.95,
  minHeight: 56,
  borderRadius: "12px",
  background: "rgba(239, 68, 68, 0.16)",
  color: "#fca5a5",
  boxShadow: "none",
  fontSize: 15,
  fontWeight: 850,
  whiteSpace: "nowrap",
  textTransform: "none",
  "&:hover": {
    background: "rgba(239, 68, 68, 0.24)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#6b7280",
  },
  "& .MuiButton-startIcon": { color: "#ef4444" },
};

const normalizeDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.split("T")[0];
  return value.toISOString().split("T")[0];
};

const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

const isNextDate = (previousDateKey, nextDateKey) =>
  getDateKey(addDays(parseDateKey(previousDateKey), 1)) === nextDateKey;

const formatDisplayDate = (dateKey) =>
  parseDateKey(dateKey).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateRange = (startDate, endDate) =>
  startDate === endDate
    ? formatDisplayDate(startDate)
    : `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;

const formatReviewedAt = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRefereeName = (request) => {
  const user = request.referee?.user;
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Referee"
  );
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const groupRequests = (rows = []) => {
  const sortedRows = rows
    .map((row) => ({
      ...row,
      dateKey: normalizeDateKey(row.date),
      approvalStatus: row.approvalStatus || "pending",
      reason: row.reason || "Unavailable",
      description: row.description || "",
      refereeName: getRefereeName(row),
    }))
    .filter((row) => row.dateKey)
    .sort((a, b) => {
      const dateCompare = a.dateKey.localeCompare(b.dateKey);
      if (dateCompare !== 0) return dateCompare;
      return a.refereeName.localeCompare(b.refereeName);
    });

  return sortedRows.reduce((groups, row) => {
    const previous = groups[groups.length - 1];
    const canExtend =
      previous &&
      previous.refereeId === row.refereeId &&
      previous.reason === row.reason &&
      previous.description === row.description &&
      previous.approvalStatus === row.approvalStatus &&
      isNextDate(previous.endDate, row.dateKey);

    if (canExtend) {
      previous.endDate = row.dateKey;
      previous.ids.push(row.id);
      previous.items.push(row);
      return groups;
    }

    groups.push({
      key: `${row.id}-${row.dateKey}`,
      refereeId: row.refereeId,
      referee: row.referee,
      refereeName: row.refereeName,
      reason: row.reason,
      description: row.description,
      approvalStatus: row.approvalStatus,
      reviewer: row.reviewer,
      reviewedAt: row.reviewedAt,
      startDate: row.dateKey,
      endDate: row.dateKey,
      ids: [row.id],
      items: [row],
    });

    return groups;
  }, []);
};

const AvailabilityRequestsPage = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const {
    data: requestsData,
    isLoading,
    error,
  } = useAvailabilityRequests({
    status: statusFilter,
    limit: 500,
    dateFrom: todayKey,
  });
  const reviewRequests = useReviewAvailabilityRequests();

  const requests = useMemo(() => requestsData?.data || [], [requestsData]);
  const groupedRequests = useMemo(() => groupRequests(requests), [requests]);

  const handleReview = async (request, approvalStatus) => {
    await reviewRequests.mutateAsync({
      ids: request.ids,
      approvalStatus,
    });
  };

  const emptyLabel =
    statusFilter === "all"
      ? "No availability requests found."
      : `No ${statusFilter} availability requests found.`;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: { xs: "34px", sm: "40px", md: "48px" },
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.05,
          }}
        >
          Availability Requests
        </Typography>
        <Typography sx={{ mt: 1, fontSize: "14px", color: "#6b7280" }}>
          Review referee unavailability submissions.
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        {STATUS_FILTERS.map((filter) => {
          const selected = statusFilter === filter.value;

          return (
            <Button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: "10px",
                bgcolor: selected ? "#f97316" : "#121214",
                border: "1px solid",
                borderColor: selected ? "#f97316" : "#242428",
                color: selected ? "#fff" : "#9ca3af",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: selected ? "#ea580c" : "#1a1a1d",
                  borderColor: selected ? "#ea580c" : "#3f3f46",
                },
              }}
            >
              {filter.label}
            </Button>
          );
        })}
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Failed to load availability requests: {error.message}
        </Alert>
      )}

      <Paper
        sx={{
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#f97316" }} />
          </Box>
        ) : groupedRequests.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <EventBusyIcon sx={{ color: "#6b7280", fontSize: 40 }} />
            <Typography sx={{ mt: 1.5, color: "#fff", fontWeight: 700 }}>
              {emptyLabel}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {groupedRequests.map((request, index) => {
              const meta =
                STATUS_META[request.approvalStatus] || STATUS_META.pending;
              const StatusIcon = meta.icon;
              const user = request.referee?.user;
              const reviewedAt = formatReviewedAt(request.reviewedAt);
              const reviewerName = request.reviewer
                ? [request.reviewer.firstName, request.reviewer.lastName]
                    .filter(Boolean)
                    .join(" ")
                : null;

              return (
                <Box
                  key={request.key}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderTop: index === 0 ? "none" : "1px solid #242428",
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      lg: "minmax(0, 1fr) auto",
                    },
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      minWidth: 0,
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar
                      src={user?.avatarUrl || undefined}
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: "#f97316",
                        color: "#fff",
                        fontWeight: 800,
                      }}
                    >
                      {getInitials(request.refereeName)}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#fff",
                            fontSize: "18px",
                            fontWeight: 700,
                          }}
                        >
                          {request.refereeName}
                        </Typography>
                        <Chip
                          icon={
                            <StatusIcon
                              sx={{ color: `${meta.color} !important` }}
                            />
                          }
                          label={meta.label}
                          sx={{
                            bgcolor: alpha(meta.color, 0.14),
                            color: meta.color,
                            fontWeight: 700,
                            borderRadius: "999px",
                            "& .MuiChip-icon": { color: meta.color },
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{ mt: 0.5, color: "#9ca3af", fontSize: "14px" }}
                      >
                        {request.reason} ·{" "}
                        {formatDateRange(request.startDate, request.endDate)}
                      </Typography>

                      {request.description && (
                        <Typography
                          sx={{
                            mt: 1,
                            color: "#6b7280",
                            fontSize: "14px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {request.description}
                        </Typography>
                      )}

                      {reviewerName && reviewedAt && (
                        <Typography
                          sx={{ mt: 1, color: "#52525b", fontSize: "13px" }}
                        >
                          Reviewed by {reviewerName} on {reviewedAt}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {request.approvalStatus === "pending" ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1.25,
                        width: { xs: "100%", lg: 300 },
                        justifySelf: { lg: "end" },
                      }}
                    >
                      <Button
                        variant='contained'
                        startIcon={<DeclineIcon />}
                        disabled={reviewRequests.isPending}
                        onClick={() => handleReview(request, "rejected")}
                        sx={rejectButtonSx}
                      >
                        Decline
                      </Button>
                      <Button
                        variant='contained'
                        startIcon={<AcceptIcon />}
                        disabled={reviewRequests.isPending}
                        onClick={() => handleReview(request, "approved")}
                        sx={approveButtonSx}
                      >
                        Approve
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
                        {request.items.length} day
                        {request.items.length === 1 ? "" : "s"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AvailabilityRequestsPage;
