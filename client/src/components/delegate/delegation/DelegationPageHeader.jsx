import { Box, IconButton, Typography } from "@mui/material";
import { ArrowBack as BackIcon, Check as CheckIcon } from "@mui/icons-material";
import { CustomButton } from "../../ui";

const getProgressTone = (assignedCount) => {
  if (assignedCount === 3) {
    return {
      color: "#22c55e",
      bg: "rgba(34,197,94,0.09)",
      border: "rgba(34,197,94,0.25)",
    };
  }

  if (assignedCount > 0) {
    return {
      color: "#f97316",
      bg: "rgba(249,115,22,0.09)",
      border: "rgba(249,115,22,0.25)",
    };
  }

  return {
    color: "#9ca3af",
    bg: "rgba(107,114,128,0.09)",
    border: "rgba(107,114,128,0.22)",
  };
};

const ActionProgress = ({ assignedCount }) => {
  const tone = getProgressTone(assignedCount);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 0.875,
        borderRadius: "10px",
        bgcolor: tone.bg,
        border: "1px solid",
        borderColor: tone.border,
        flex: { xs: "1 1 145px", sm: "0 0 auto" },
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: index < assignedCount ? tone.color : "#3f3f46",
              transition: "background 0.3s",
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: tone.color }}>
        {assignedCount}/3 assigned
      </Typography>
    </Box>
  );
};

const actionButtonWrapperSx = {
  flex: { xs: "1 1 180px", sm: "0 0 auto" },
  width: { xs: "100%", sm: "auto" },
};

const actionButtonSx = {
  flex: { xs: "1 1 180px", sm: "0 0 auto" },
  width: { xs: "100%", sm: "auto" },
  justifyContent: "center",
  "&.Mui-disabled": {
    bgcolor: "#3f3f46",
    color: "#6b7280",
  },
};

const DelegationPageHeader = ({
  match,
  assignedCount,
  isMatchFinished,
  showFinishMatchAction,
  canCompleteMatch,
  finishDisabledReason,
  saveDisabledReason,
  isSavingAssignment,
  isSavingResult,
  onBack,
  onSaveAssignment,
  onOpenResultModal,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.25, sm: 2 },
            minWidth: 0,
          }}
        >
          <IconButton
            aria-label='Back to matches'
            onClick={onBack}
            sx={{ color: "#9ca3af", "&:hover": { bgcolor: "#242428" } }}
          >
            <BackIcon />
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "19px", sm: "22px" },
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Referee Assignment
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {match?.homeTeam?.name || "TBA"} vs{" "}
              {match?.awayTeam?.name || "TBA"}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          {isMatchFinished ? (
            <Typography
              sx={{
                width: { xs: "100%", sm: "auto" },
                px: 1.5,
                py: 0.875,
                borderRadius: "10px",
                color: "#8dd9a8",
                bgcolor: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.18)",
                fontSize: "13px",
                fontWeight: 700,
                textAlign: { xs: "left", sm: "right" },
              }}
            >
              This match is finished.
            </Typography>
          ) : (
            <>
              <ActionProgress assignedCount={assignedCount} />

              {showFinishMatchAction ? (
                <CustomButton
                  variant='success'
                  startIcon={<CheckIcon />}
                  onClick={onOpenResultModal}
                  disabled={!canCompleteMatch || isSavingResult}
                  loading={isSavingResult}
                  infoTooltip={!canCompleteMatch ? finishDisabledReason : ""}
                  tooltipWrapperSx={actionButtonWrapperSx}
                  sx={actionButtonSx}
                >
                  Finish Match
                </CustomButton>
              ) : (
                <CustomButton
                  variant='delegate-primary'
                  startIcon={<CheckIcon />}
                  onClick={onSaveAssignment}
                  disabled={Boolean(saveDisabledReason) || isSavingAssignment}
                  loading={isSavingAssignment}
                  infoTooltip={saveDisabledReason}
                  tooltipWrapperSx={actionButtonWrapperSx}
                  sx={actionButtonSx}
                >
                  Save Assignment
                </CustomButton>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DelegationPageHeader;
