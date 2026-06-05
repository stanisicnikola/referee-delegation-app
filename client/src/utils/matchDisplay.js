export const getMatchTitle = (match, fallback = "TBA") =>
  `${match?.homeTeam?.name || fallback} vs ${match?.awayTeam?.name || fallback}`;

export const getVenueLabel = (venue, fallback = "Venue TBA") =>
  [venue?.name, venue?.city].filter(Boolean).join(", ") || fallback;
