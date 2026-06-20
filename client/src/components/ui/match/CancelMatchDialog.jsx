import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";

const CancelMatchDialog = ({
  open,
  isLoading,
  accentColor = "#8b5cf6",
  primaryButtonVariant = "admin-primary",
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    const statusReason = reason.trim();
    if (!statusReason) return;

    await onSubmit({
      status: "cancelled",
      statusReason,
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
            Cancel Match
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={isLoading}
            sx={{ color: "#6b7280", "&:hover": { bgcolor: "#242428" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <CustomInput
            label='Cancellation reason *'
            placeholder='Why is this match being cancelled?'
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
            disabled={isLoading || !reason.trim()}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel Match
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CancelMatchDialog;
