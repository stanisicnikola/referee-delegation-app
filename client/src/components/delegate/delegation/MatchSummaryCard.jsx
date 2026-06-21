import { Box, Typography } from "@mui/material";
import {
  AccessTime as TimeIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import MatchStatusBadge from "../../user/MatchStatusBadge";
import DelegationStatusBadge from "../DelegationStatusBadge";
import { formatMatchSummaryDate } from "../../../utils/dateFormatters";

const SummaryBadge = ({ children, tone = "neutral" }) => {
  const isCompetition = tone === "competition";

  return (
    <Box
      sx={{
        fontSize: "12px",
        fontWeight: isCompetition ? 600 : 500,
        color: isCompetition ? "#f97316" : "#9ca3af",
        bgcolor: isCompetition
          ? "rgba(249, 115, 22, 0.1)"
          : "rgba(107, 114, 128, 0.1)",
        border: "1px solid",
        borderColor: isCompetition
          ? "rgba(249, 115, 22, 0.25)"
          : "rgba(107, 114, 128, 0.2)",
        px: 1.25,
        py: 0.5,
        borderRadius: "6px",
        lineHeight: 1.6,
      }}
    >
      {children}
    </Box>
  );
};

const MatchTiming = ({ dateInfo, matchStatus, mobile = false }) => (
  <Box
    sx={{
      display: mobile ? { xs: "flex", md: "none" } : { xs: "none", md: "flex" },
      flexDirection: "column",
      alignItems: "center",
      gap: mobile ? 0.75 : 0.15,
      mb: mobile ? 0.5 : 0,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        justifyContent: "center",
        mt: mobile ? 0 : 1,
      }}
    >
      <EventIcon sx={{ fontSize: mobile ? 14 : 16, color: "#6b7280" }} />
      <Typography
        sx={{
          color: "#9ca3af",
          fontSize: mobile ? 12 : 14,
          whiteSpace: "nowrap",
        }}
      >
        {dateInfo.shortDay}, {dateInfo.fullDate}
      </Typography>
    </Box>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        justifyContent: "center",
        mt: mobile ? 0 : 0.5,
      }}
    >
      <TimeIcon sx={{ fontSize: mobile ? 14 : 17, color: "#f97316" }} />
      <Typography
        sx={{
          color: "#f97316",
          fontSize: mobile ? 17 : 22,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {dateInfo.time}
      </Typography>
    </Box>
    <MatchStatusBadge
      status={matchStatus}
      sx={{
        mt: mobile ? 0 : 1.1,
        py: 0.4,
        borderRadius: "9999px",
        "& .MuiTypography-root": {
          fontSize: mobile ? 12 : 13,
          fontWeight: 700,
        },
      }}
    />
  </Box>
);

const VsBlock = () => (
  <Box
    sx={{
      textAlign: "center",
      px: { xs: 0, md: 2 },
      width: "100%",
    }}
  >
    <Box
      sx={{
        display: { xs: "grid", md: "block" },
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 1.25,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          height: "1px",
          bgcolor: "#1e1e22",
        }}
      />
      <Typography
        sx={{
          color: "#2e2e33",
          fontSize: { xs: 26, md: 30 },
          fontWeight: 800,
          letterSpacing: "0.1em",
          lineHeight: 1,
        }}
      >
        VS
      </Typography>
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          height: "1px",
          bgcolor: "#1e1e22",
        }}
      />
    </Box>
  </Box>
);

const TeamBadge = ({ team, color, size = 56 }) => {
  const initials = (
    team?.shortName ||
    team?.name?.substring(0, 3) ||
    "TBA"
  ).toUpperCase();

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "14px",
        bgcolor: `${color}14`,
        border: `1px solid ${color}30`,
        color,
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: "0.04em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  );
};

const MobileUpcomingTeam = ({ team, sideLabel, color }) => (
  <Box
    sx={{
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      textAlign: "center",
    }}
  >
    <TeamBadge team={team} color={color} size={54} />
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 700,
          fontSize: { xs: 15, sm: 16 },
          lineHeight: 1.18,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {team?.name || "TBA"}
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.35 }}>
        {sideLabel}
      </Typography>
    </Box>
  </Box>
);

const MobileUpcomingMatchup = ({ match }) => (
  <Box
    sx={{
      display: { xs: "grid", md: "none" },
      gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
      alignItems: "center",
      gap: { xs: 1.25, sm: 2 },
      py: 0.5,
    }}
  >
    <MobileUpcomingTeam
      team={match?.homeTeam}
      sideLabel='Home'
      color='#3b82f6'
    />
    <Typography
      sx={{
        color: "#2e2e33",
        fontSize: { xs: 24, sm: 28 },
        fontWeight: 800,
        letterSpacing: "0.08em",
        lineHeight: 1,
        px: { xs: 0.5, sm: 1 },
      }}
    >
      VS
    </Typography>
    <MobileUpcomingTeam
      team={match?.awayTeam}
      sideLabel='Away'
      color='#ef4444'
    />
  </Box>
);

const ScoreBox = ({ score }) => (
  <Box
    sx={{
      width: { xs: 54, md: 64 },
      minWidth: { xs: 54, md: 64 },
      height: { xs: 54, md: 64 },
      borderRadius: "10px",
      bgcolor: "rgba(34, 197, 94, 0.08)",
      border: "1px solid rgba(34, 197, 94, 0.22)",
      color: "#d1fae5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: { xs: 23, md: 28 },
      fontWeight: 800,
      lineHeight: 1,
      flexShrink: 0,
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
    }}
  >
    {score}
  </Box>
);

const DesktopMatchupTeam = ({ team, sideLabel, color }) => (
  <Box
    sx={{
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1.2,
      textAlign: "center",
    }}
  >
    <TeamBadge team={team} color={color} size={{ md: 58, lg: 62 }} />
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 700,
          fontSize: { md: 17, lg: 18 },
          lineHeight: 1.18,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {team?.name || "TBA"}
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.55 }}>
        {sideLabel}
      </Typography>
    </Box>
  </Box>
);

const DesktopMatchup = ({ match, dateInfo, matchStatus, isMatchFinished }) => (
  <Box
    sx={{
      display: { xs: "none", md: "grid" },
      justifyItems: "center",
      gap: { md: 4, lg: 4.75 },
      pb: { md: 1.25, lg: 1.5 },
      minWidth: 0,
    }}
  >
    <MatchTiming dateInfo={dateInfo} matchStatus={matchStatus} />

    <Box
      sx={{
        width: "100%",
        maxWidth: isMatchFinished
          ? { md: 960, lg: 1060 }
          : { md: 900, lg: 980 },
        mx: "auto",
        display: "grid",
        gridTemplateColumns: isMatchFinished
          ? "minmax(0, 1fr) auto 74px auto minmax(0, 1fr)"
          : "minmax(0, 1fr) 92px minmax(0, 1fr)",
        alignItems: "center",
        columnGap: { md: 1.5, lg: 3 },
        minWidth: 0,
      }}
    >
      <DesktopMatchupTeam
        team={match?.homeTeam}
        sideLabel='Home'
        color='#3b82f6'
      />

      {isMatchFinished && <ScoreBox score={match?.homeScore} />}

      <Typography
        sx={{
          color: "#2e2e33",
          fontSize: { md: 30, lg: 34 },
          fontWeight: 800,
          letterSpacing: "0.08em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        VS
      </Typography>

      {isMatchFinished && <ScoreBox score={match?.awayScore} />}

      <DesktopMatchupTeam
        team={match?.awayTeam}
        sideLabel='Away'
        color='#ef4444'
      />
    </Box>
  </Box>
);

const TeamSummary = ({ team, sideLabel, color, align = "left", score }) => {
  const isRight = align === "right";
  const hasScore = score !== null && score !== undefined;

  const desktopColumns = hasScore
    ? isRight
      ? "64px minmax(0, 1fr) 56px"
      : "56px minmax(0, 1fr) 64px"
    : isRight
      ? "minmax(0, 1fr) 56px"
      : "56px minmax(0, 1fr)";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: hasScore ? "52px minmax(0, 1fr) 58px" : "52px minmax(0, 1fr)",
          md: desktopColumns,
        },
        alignItems: "center",
        gap: { xs: 1.5, md: 1.75 },
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          gridColumn: { xs: 1, md: isRight ? (hasScore ? 3 : 2) : 1 },
          gridRow: 1,
        }}
      >
        <TeamBadge team={team} color={color} size={{ xs: 52, md: 56 }} />
      </Box>
      <Box
        sx={{
          textAlign: { xs: "left", md: isRight ? "right" : "left" },
          minWidth: 0,
          gridColumn: { xs: 2, md: isRight && !hasScore ? 1 : 2 },
          gridRow: 1,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: 16, md: 17 },
            lineHeight: 1.18,
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "normal",
          }}
        >
          {team?.name || "TBA"}
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 0.35 }}>
          {sideLabel}
        </Typography>
      </Box>
      {hasScore && (
        <Box
          sx={{
            gridColumn: { xs: 3, md: isRight ? 1 : 3 },
            gridRow: 1,
            width: { xs: 54, md: 58 },
            minWidth: { xs: 54, md: 58 },
            height: { xs: 54, md: 58 },
            borderRadius: "10px",
            bgcolor: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.22)",
            color: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: { xs: 23, md: 24 },
            fontWeight: 800,
            lineHeight: 1,
            flexShrink: 0,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          {score}
        </Box>
      )}
    </Box>
  );
};

const MatchSummaryCard = ({
  match,
  effectiveMatchStatus,
  isMatchClosed,
  isMatchFinished,
  cancellationReason,
}) => {
  const dateInfo = formatMatchSummaryDate(match?.scheduledAt);

  return (
    <Box
      sx={{
        bgcolor: "#121214",
        borderRadius: "16px",
        border: "1px solid #242428",
        p: { xs: 2, sm: 3, md: 3.25 },
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <SummaryBadge tone='competition'>
            {match?.competition?.name || "League"}
          </SummaryBadge>
          <SummaryBadge>Round {match?.round || "-"}</SummaryBadge>
        </Box>

        {!isMatchClosed && (
          <DelegationStatusBadge
            status={match?.delegationStatus}
            sx={{ flexShrink: 0 }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: { xs: isMatchFinished ? "grid" : "block", md: "block" },
          gridTemplateColumns: { xs: "1fr" },
          alignItems: "center",
          gap: { xs: 2 },
          py: { xs: 1, md: 0.5 },
          minWidth: 0,
        }}
      >
        <MatchTiming
          dateInfo={dateInfo}
          matchStatus={effectiveMatchStatus}
          mobile
        />

        {!isMatchFinished && <MobileUpcomingMatchup match={match} />}

        <DesktopMatchup
          match={match}
          dateInfo={dateInfo}
          matchStatus={effectiveMatchStatus}
          isMatchFinished={isMatchFinished}
        />

        <Box
          sx={{
            display: { xs: isMatchFinished ? "block" : "none", md: "none" },
          }}
        >
          <TeamSummary
            team={match?.homeTeam}
            sideLabel='Home'
            color='#3b82f6'
            score={isMatchFinished ? match?.homeScore : undefined}
          />
        </Box>

        <Box
          sx={{
            display: { xs: isMatchFinished ? "block" : "none", md: "none" },
          }}
        >
          <VsBlock />
        </Box>

        <Box
          sx={{
            display: { xs: isMatchFinished ? "block" : "none", md: "none" },
          }}
        >
          <TeamSummary
            team={match?.awayTeam}
            sideLabel='Away'
            color='#ef4444'
            align='right'
            score={isMatchFinished ? match?.awayScore : undefined}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: "1px solid #1e1e22",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <LocationIcon sx={{ fontSize: 15, color: "#6b7280" }} />
        <Typography
          sx={{
            fontSize: 13,
            color: "#9ca3af",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}
        >
          {match?.venue?.name || "TBA"}
          {match?.venue?.city ? `, ${match.venue.city}` : ""}
        </Typography>
      </Box>

      {match?.status === "cancelled" && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.24)",
            bgcolor: "rgba(239,68,68,0.08)",
          }}
        >
          <Typography sx={{ color: "#fca5a5", fontSize: 13, fontWeight: 700 }}>
            This match was cancelled.
          </Typography>
          {cancellationReason && (
            <Typography sx={{ color: "#9ca3af", fontSize: 12, mt: 0.35 }}>
              Reason: {cancellationReason}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MatchSummaryCard;
