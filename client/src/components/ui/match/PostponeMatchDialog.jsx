import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";

const getTodayDateValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const PostponeMatchDialog = ({
  open,
  editMatch,
  isLoading,
  accentColor = "#8b5cf6",
  primaryButtonVariant = "admin-primary",
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeTime, setPostponeTime] = useState("");

  useEffect(() => {
    if (!open) return;

    const matchDate = editMatch?.scheduledAt
      ? new Date(editMatch.scheduledAt)
      : null;

    setReason("");
    setPostponeDate(matchDate ? matchDate.toISOString().split("T")[0] : "");
    setPostponeTime(matchDate ? matchDate.toTimeString().substring(0, 5) : "");
  }, [editMatch?.scheduledAt, open]);

  if (!open) return null;

  const todayDate = getTodayDateValue();
  const selectedDateTime =
    postponeDate && postponeTime
      ? new Date(`${postponeDate}T${postponeTime}`)
      : null;
  const dateTimeIsPast = Boolean(
    selectedDateTime && selectedDateTime.getTime() <= Date.now(),
  );
  const disabled =
    isLoading ||
    !reason.trim() ||
    !postponeDate ||
    !postponeTime ||
    dateTimeIsPast;

  const handleSubmit = async () => {
    const statusReason = reason.trim();
    if (!statusReason || !postponeDate || !postponeTime) return;

    await onSubmit({
      status: "postponed",
      statusReason,
      scheduledAt: new Date(`${postponeDate}T${postponeTime}`).toISOString(),
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        alignItems: { xs: "flex-end", sm: "center" },
        justifyContent: "center",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.62)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>
            Postpone Match
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={isLoading}
            sx={{ color: "#6b7280", "&:hover": { bgcolor: "#242428" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <CustomInput
              type='date'
              label='New date *'
              value={postponeDate}
              accentColor={accentColor}
              onChange={(event) => setPostponeDate(event.target.value)}
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1)",
                },
              }}
              slotProps={{
                htmlInput: {
                  min: todayDate,
                },
              }}
            />
            <CustomInput
              type='time'
              label='New time *'
              value={postponeTime}
              accentColor={accentColor}
              onChange={(event) => setPostponeTime(event.target.value)}
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1)",
                },
              }}
            />
          </Box>

          <CustomInput
            label='Postponement reason *'
            placeholder='Why is this match being postponed?'
            multiline
            rows={3}
            value={reason}
            accentColor={accentColor}
            onChange={(event) => setReason(event.target.value)}
          />
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            flexDirection: { xs: "column-reverse", sm: "row" },
          }}
        >
          <CustomButton
            variant='outline'
            onClick={onClose}
            disabled={isLoading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant={primaryButtonVariant}
            onClick={handleSubmit}
            loading={isLoading}
            disabled={disabled}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Postpone Match
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PostponeMatchDialog;
