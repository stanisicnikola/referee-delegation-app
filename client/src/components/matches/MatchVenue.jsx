import { Box, Typography } from "@mui/material";
import { delegatePanelColors as COLORS } from "../../theme/theme";

const MatchVenue = ({ venue }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: 13,
        color: COLORS.text,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {venue?.name || "TBA"}
    </Typography>
    <Typography sx={{ fontSize: 12, color: COLORS.muted }}>
      {venue?.city || ""}
    </Typography>
  </Box>
);

export default MatchVenue;
