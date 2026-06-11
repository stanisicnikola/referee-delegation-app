import { Box, Typography } from "@mui/material";
import { formatDateTimeLabel } from "../../utils/dateFormatters";
import { delegatePanelColors as COLORS } from "../../theme/theme";

const MatchDateTime = ({ scheduledAt }) => {
  const dateInfo = formatDateTimeLabel(scheduledAt, {
    date: "--/--/----",
    time: "--:--",
  });

  return (
    <Box sx={{ whiteSpace: "nowrap" }}>
      <Typography
        sx={{
          fontSize: 13,
          fontFamily: "monospace",
          color: COLORS.text,
        }}
      >
        {dateInfo.date}
      </Typography>
      <Typography sx={{ fontSize: 12, color: COLORS.muted }}>
        {dateInfo.time}
      </Typography>
    </Box>
  );
};

export default MatchDateTime;
