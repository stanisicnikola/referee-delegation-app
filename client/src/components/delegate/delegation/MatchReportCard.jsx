import { Box, Typography } from "@mui/material";

const MatchReportCard = ({ reportNotes }) => (
  <Box
    sx={{
      bgcolor: "#121214",
      borderRadius: "16px",
      border: "1px solid #242428",
      p: { xs: 2, sm: 3 },
    }}
  >
    <Typography sx={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
      Match Report
    </Typography>
    <Box
      sx={{
        mt: 1.5,
        p: { xs: 1.5, sm: 2 },
        borderRadius: "12px",
        bgcolor: "#0d0d0f",
        border: "1px solid #1e1e22",
        minHeight: 72,
      }}
    >
      <Typography
        sx={{
          color: reportNotes ? "#d1d5db" : "#6b7280",
          fontSize: 14,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {reportNotes || "No report notes added."}
      </Typography>
    </Box>
  </Box>
);

export default MatchReportCard;
