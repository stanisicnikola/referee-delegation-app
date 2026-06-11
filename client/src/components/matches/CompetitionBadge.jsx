import { Box } from "@mui/material";
import { delegatePanelColors as COLORS } from "../../theme/theme";

const CompetitionBadge = ({ competition }) => (
  <Box
    sx={{
      fontSize: 12,
      fontWeight: 700,
      color: COLORS.muted,
      bgcolor: "rgba(107, 114, 128, 0.1)",
      px: 1,
      py: 0.5,
      borderRadius: "6px",
      whiteSpace: "nowrap",
      display: "inline-block",
      maxWidth: 170,
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {competition?.name || "N/A"}
  </Box>
);

export default CompetitionBadge;
