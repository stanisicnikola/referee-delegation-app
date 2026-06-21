import { Box, Typography } from "@mui/material";
import { ArrowBack as BackIcon, Event as EventIcon } from "@mui/icons-material";
import { CustomButton } from "../../ui";

const MatchNotFound = ({ onBack }) => (
  <Box
    sx={{
      p: 0,
      pt: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: "16px",
        bgcolor: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <EventIcon sx={{ fontSize: 30, color: "#ef4444", opacity: 0.7 }} />
    </Box>
    <Typography sx={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>
      Match not found
    </Typography>
    <Typography sx={{ color: "#6b7280", fontSize: 14, maxWidth: 280 }}>
      This match doesn't exist or you don't have access to it.
    </Typography>
    <CustomButton
      variant='delegate-outline'
      startIcon={<BackIcon />}
      onClick={onBack}
      sx={{ mt: 1 }}
    >
      Back to matches
    </CustomButton>
  </Box>
);

export default MatchNotFound;
