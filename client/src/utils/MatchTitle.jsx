import { Box } from "@mui/material";

const MatchTitle = ({
  match,
  fallback = "TBA",
  separator = "vs",
  sx = {},
  separatorSx = {},
}) => (
  <Box component='span' sx={{ minWidth: 0, ...sx }}>
    {match?.homeTeam?.name || fallback}
    <Box
      component='span'
      sx={{
        color: "#4b5563",
        fontWeight: 500,
        mx: 0.75,
        ...separatorSx,
      }}
    >
      {separator}
    </Box>
    {match?.awayTeam?.name || fallback}
  </Box>
);

export default MatchTitle;
