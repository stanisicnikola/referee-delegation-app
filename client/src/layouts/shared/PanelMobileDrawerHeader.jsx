import { Box, IconButton } from "@mui/material";
import { ChevronLeft as ChevronLeftIcon } from "@mui/icons-material";

const PanelMobileDrawerHeader = ({ onClose }) => (
  <Box
    sx={{
      p: 1,
      display: "flex",
      justifyContent: "flex-end",
      flexShrink: 0,
      bgcolor: "#121214",
    }}
  >
    <IconButton onClick={onClose} sx={{ color: "#9ca3af" }}>
      <ChevronLeftIcon />
    </IconButton>
  </Box>
);

export default PanelMobileDrawerHeader;
