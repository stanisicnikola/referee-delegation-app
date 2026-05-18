import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import CustomButton from "./CustomButton";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
          borderRadius: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "divider",
          width: { xs: "calc(100vw - 32px)", sm: 400 },
          maxWidth: "none",
          m: { xs: 2, sm: 3 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, px: { xs: 2, sm: 3 } }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.secondary" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2 },
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: { xs: 1, sm: 1 },
          "& > :not(style) ~ :not(style)": {
            ml: { xs: 0, sm: 1 },
          },
        }}
      >
        <CustomButton
          variant='secondary'
          onClick={onClose}
          disabled={loading}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {cancelText}
        </CustomButton>
        <CustomButton
          onClick={onConfirm}
          color={confirmColor}
          variant='danger'
          disabled={loading}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {loading ? "Processing..." : confirmText}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
