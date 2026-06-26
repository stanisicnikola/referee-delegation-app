import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CustomButton, CustomInput, CustomSelect } from "../../ui";
import { DECLINE_REASONS, PENDING_COLORS as COLORS } from "./constants";

const DeclineAssignmentDialog = ({
  fullScreen,
  open,
  assignment,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [declineReason, setDeclineReason] = useState("");
  const [declineNote, setDeclineNote] = useState("");

  useEffect(() => {
    if (!open) return;

    setDeclineReason("");
    setDeclineNote("");
  }, [open, assignment?.matchId]);

  const handleSubmit = () => {
    if (!declineReason || isSubmitting) return;

    onSubmit({
      reason: declineReason,
      notes: declineNote,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
            bgcolor: COLORS.card,
            backgroundImage: "none",
            border: `1px solid ${COLORS.border}`,
            borderRadius: fullScreen ? 0 : "16px",
          },
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
              {assignment.matchLabel}
            </Typography>
            <Typography sx={{ color: COLORS.muted, fontSize: 14, mt: 0.5 }}>
              {assignment.dateInfo?.full}
            </Typography>
          </Box>
        )}

        <Stack spacing={3}>
          <CustomSelect
            variant='referee'
            label='Reason for declining'
            placeholder='Select reason'
            options={DECLINE_REASONS}
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
          />

          <CustomInput
            label='Additional notes (optional)'
            multiline
            rows={3}
            value={declineNote}
            onChange={(event) => setDeclineNote(event.target.value)}
            placeholder='Add any useful context...'
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: COLORS.panel,
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.14)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.24)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: COLORS.green,
                  boxShadow: "none",
                },
              },
            }}
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
        <CustomButton variant='outline' onClick={onClose}>
          Cancel
        </CustomButton>
        <CustomButton
          onClick={handleSubmit}
          variant='referee-decline'
          loading={isSubmitting}
          disabled={!declineReason || isSubmitting}
        >
          Decline Assignment
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeclineAssignmentDialog;
