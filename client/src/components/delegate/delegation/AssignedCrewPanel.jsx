import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { SLOT_CONFIG } from "./constants";
import { getRefereeCategoryLabel } from "../../../constants/refereeCategories";

const AssignmentSlot = ({ config, referee, assignment, locked, onRemove }) => {
  const response = assignment?.status;
  const isAccepted = response === "accepted";
  const isPending = response === "pending";
  const canRemove = referee && !locked && !isAccepted;

  if (!referee) {
    return (
      <Box
        sx={{
          borderRadius: "12px",
          p: 2,
          bgcolor: "#0d0d0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          border: "1px solid #1a1a1d",
          borderLeft: `3px solid ${config.accent}33`,
        }}
      >
        <Box>
          <Typography sx={{ color: "#6b7280", fontSize: 14, fontWeight: 600 }}>
            {config.label}
          </Typography>
          <Typography sx={{ color: "#3f3f46", fontSize: 12, mt: 0.25 }}>
            {config.hint}
          </Typography>
        </Box>
        <Box
          sx={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#3f3f46",
            border: "1px dashed #2a2a2e",
            px: 1.25,
            py: 0.5,
            borderRadius: "6px",
            whiteSpace: "nowrap",
          }}
        >
          Unassigned
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: "12px",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        bgcolor: `${config.accent}0c`,
        border: `1px solid ${config.accent}28`,
        borderLeft: `3px solid ${config.accent}`,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            fontWeight: 700,
            fontSize: 14,
            bgcolor: `${config.accent}1e`,
            color: config.accent,
            border: `1px solid ${config.accent}44`,
          }}
        >
          {referee.user?.firstName?.[0]}
          {referee.user?.lastName?.[0]}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              {referee.user?.firstName} {referee.user?.lastName}
            </Typography>
            <Box
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: config.accent,
                bgcolor: `${config.accent}15`,
                border: `1px solid ${config.accent}30`,
                px: 1,
                py: "2px",
                borderRadius: "4px",
                lineHeight: 1.6,
              }}
            >
              {config.label}
            </Box>
            {response && (
              <Box
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isAccepted ? "#22c55e" : "#eab308",
                  bgcolor: isAccepted
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(234,179,8,0.12)",
                  border: "1px solid",
                  borderColor: isAccepted
                    ? "rgba(34,197,94,0.28)"
                    : "rgba(234,179,8,0.28)",
                  px: 1,
                  py: "2px",
                  borderRadius: "4px",
                  lineHeight: 1.6,
                }}
              >
                {isAccepted
                  ? "Accepted"
                  : isPending
                    ? "Waiting to accept"
                    : "Assigned"}
              </Box>
            )}
          </Box>
          <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.25 }}>
            Category: {getRefereeCategoryLabel(referee.licenseCategory)} -{" "}
            {referee.city || "N/A"}
          </Typography>
        </Box>
      </Box>

      {canRemove && (
        <IconButton
          onClick={onRemove}
          size='small'
          sx={{
            color: "#4b5563",
            flexShrink: 0,
            "&:hover": { bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444" },
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      )}
    </Box>
  );
};

const getCrewSubtitle = ({
  match,
  assignedCount,
  isConfirmed,
  hasFullSavedCrew,
  isMatchStarted,
}) => {
  if (match?.status === "cancelled") {
    return "This match was cancelled. Referee assignments were released.";
  }

  if (assignedCount === 3) {
    if (isConfirmed) return "All referees confirmed this match.";
    if (hasFullSavedCrew)
      return "Full crew assigned - waiting for confirmations.";
    return "Full crew - ready to save.";
  }

  if (isMatchStarted) return "Match started - assignment is locked.";

  return "Select referees from the right panel.";
};

const AssignedCrewPanel = ({
  match,
  assignedCount,
  assignedReferees,
  assignmentMeta,
  isAssignmentLocked,
  isConfirmed,
  hasFullSavedCrew,
  isMatchStarted,
  onRemove,
}) => (
  <Box
    sx={{
      bgcolor: "#121214",
      borderRadius: "16px",
      border: "1px solid #242428",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2.5,
        borderBottom: "1px solid #242428",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Box>
        <Typography sx={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
          Assigned Crew
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.25 }}>
          {getCrewSubtitle({
            match,
            assignedCount,
            isConfirmed,
            hasFullSavedCrew,
            isMatchStarted,
          })}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 0.75, mt: 0.5, flexShrink: 0 }}>
        {SLOT_CONFIG.map((config) => (
          <Box
            key={config.slot}
            sx={{
              width: 28,
              height: 6,
              borderRadius: "9999px",
              bgcolor: assignedReferees[config.slot]
                ? config.accent
                : "#1e1e22",
              border: `1px solid ${
                assignedReferees[config.slot] ? config.accent + "55" : "#2e2e33"
              }`,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>

    <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: "grid", gap: 1.5 }}>
      {SLOT_CONFIG.map((config) => (
        <AssignmentSlot
          key={config.slot}
          config={config}
          referee={assignedReferees[config.slot]}
          assignment={assignmentMeta[config.slot]}
          locked={isAssignmentLocked}
          onRemove={() => onRemove(config.slot)}
        />
      ))}
    </Box>
  </Box>
);

export default AssignedCrewPanel;
