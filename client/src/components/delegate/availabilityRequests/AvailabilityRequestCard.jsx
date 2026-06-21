import { Avatar, Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccessTime as AccessTimeIcon,
  Check as AcceptIcon,
  CheckCircle as CheckCircleIcon,
  Close as DeclineIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { CustomButton } from "../../ui";
import {
  formatAvailabilityRequestDateRange,
  formatReviewedAt,
  getAvailabilityRequestStatusMeta,
  getInitials,
  getReviewerName,
} from "./availabilityRequestUtils";

const STATUS_ICONS = {
  pending: AccessTimeIcon,
  approved: CheckCircleIcon,
  rejected: WarningAmberIcon,
};

const AvailabilityRequestStatusBadge = ({ status }) => {
  const meta = getAvailabilityRequestStatusMeta(status);
  const StatusIcon = STATUS_ICONS[status] || STATUS_ICONS.pending;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        borderRadius: "999px",
        bgcolor: alpha(meta.color, 0.14),
        color: meta.color,
        fontWeight: 700,
      }}
    >
      <StatusIcon sx={{ color: meta.color, fontSize: 18 }} />
      <Typography sx={{ color: meta.color, fontSize: "13px", fontWeight: 700 }}>
        {meta.label}
      </Typography>
    </Box>
  );
};

const AvailabilityRequestCard = ({
  request,
  isFirst = false,
  reviewing = false,
  onReview,
}) => {
  const user = request.referee?.user;
  const reviewedAt = formatReviewedAt(request.reviewedAt);
  const reviewerName = getReviewerName(request.reviewer);
  const isPending = request.approvalStatus === "pending";

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderTop: isFirst ? "none" : "1px solid #242428",
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
            <AvailabilityRequestStatusBadge status={request.approvalStatus} />
          </Box>

          <Typography sx={{ mt: 0.5, color: "#9ca3af", fontSize: "14px" }}>
            {request.reason} ·{" "}
            {formatAvailabilityRequestDateRange(
              request.startDate,
              request.endDate,
            )}
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
            <Typography sx={{ mt: 1, color: "#52525b", fontSize: "13px" }}>
              Reviewed by {reviewerName} on {reviewedAt}
            </Typography>
          )}
        </Box>
      </Box>

      {isPending ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.25,
            width: { xs: "100%", lg: 300 },
            justifySelf: { lg: "end" },
          }}
        >
          <CustomButton
            variant='referee-decline'
            startIcon={<DeclineIcon />}
            disabled={reviewing}
            onClick={() => onReview(request, "rejected")}
          >
            Decline
          </CustomButton>
          <CustomButton
            variant='referee-accept'
            startIcon={<AcceptIcon />}
            disabled={reviewing}
            onClick={() => onReview(request, "approved")}
          >
            Approve
          </CustomButton>
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
            {request.items.length} day{request.items.length === 1 ? "" : "s"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AvailabilityRequestCard;
