import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant='body2'
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size='small'
          sx={{
            color: "text.secondary",
            ml: 2,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
