import { useMemo, useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { EventBusy as EventBusyIcon } from "@mui/icons-material";
import {
  useAvailabilityRequests,
  useReviewAvailabilityRequests,
} from "../../hooks/useAvailability";
import { LoadingSpinner } from "../../components/ui";
import {
  AvailabilityRequestCard,
  AvailabilityRequestFilters,
  getDateKey,
  groupAvailabilityRequests,
} from "../../components/delegate/availabilityRequests";

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
  const groupedRequests = useMemo(
    () => groupAvailabilityRequests(requests),
    [requests],
  );

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
          Unavailability Requests
        </Typography>
        <Typography sx={{ mt: 1, fontSize: "14px", color: "#6b7280" }}>
          Review referee unavailability submissions.
        </Typography>
      </Box>

      <AvailabilityRequestFilters
        value={statusFilter}
        onChange={setStatusFilter}
      />

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
          <LoadingSpinner />
        ) : groupedRequests.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <EventBusyIcon sx={{ color: "#6b7280", fontSize: 40 }} />
            <Typography sx={{ mt: 1.5, color: "#fff", fontWeight: 700 }}>
              {emptyLabel}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {groupedRequests.map((request, index) => (
              <AvailabilityRequestCard
                key={request.key}
                request={request}
                isFirst={index === 0}
                reviewing={reviewRequests.isPending}
                onReview={handleReview}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AvailabilityRequestsPage;
