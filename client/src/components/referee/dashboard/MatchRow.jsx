import { Box, Chip, Typography } from "@mui/material";
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import {
  RefereeAssignmentStatusBadge,
  RefereeRoleBadge,
} from "../../ui";
import { DASHBOARD_COLORS as COLORS } from "./constants";

const DateBlock = ({ dateInfo }) => (
  <Box sx={{ textAlign: "center", minWidth: 72 }}>
    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: 12,
        textTransform: "uppercase",
        fontWeight: 800,
      }}
    >
      {dateInfo.weekday}
    </Typography>
    <Typography sx={{ color: COLORS.text, fontSize: 23, fontWeight: 800 }}>
      {dateInfo.day}
    </Typography>
    <Typography sx={{ color: COLORS.mutedStrong, fontSize: 13 }}>
      {dateInfo.month}
    </Typography>
  </Box>
);

const CompetitionBadge = ({ label }) => (
  <Chip
    label={label}
    size='small'
    sx={{
      height: 24,
      borderRadius: "6px",
      bgcolor: `${COLORS.orange}1f`,
      color: COLORS.orange,
      fontWeight: 800,
      fontSize: 12,
      maxWidth: 180,
      "& .MuiChip-label": {
        px: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }}
  />
);

const MatchRow = ({ assignment, isLast, onPending }) => {
  const dateInfo = assignment.dateInfo || {
    weekday: "-",
    day: "--",
    month: "---",
    time: "--:--",
  };
  const isPending = assignment.status === "pending";

  return (
    <Box
      onClick={isPending ? onPending : undefined}
      sx={{
        px: { xs: 2.25, md: 3 },
        py: 2.25,
        borderBottom: isLast ? "none" : `1px solid ${COLORS.borderSoft}`,
        cursor: isPending ? "pointer" : "default",
        transition: "background-color 0.16s ease",
        "&:hover": { bgcolor: COLORS.cardHover },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "72px minmax(0, 1fr)",
            md: "76px 1px minmax(0, 1fr) auto",
          },
          alignItems: "center",
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <DateBlock dateInfo={dateInfo} />

        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 1,
            height: 58,
            bgcolor: COLORS.border,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            <CompetitionBadge label={assignment.competitionLabel} />
            <RefereeRoleBadge
              role={assignment.role}
              sx={{
                height: 24,
                borderRadius: "6px",
                fontSize: 12,
                maxWidth: 180,
                "& .MuiChip-label": {
                  px: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              color: COLORS.text,
              fontSize: { xs: "0.95rem", md: "1rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { xs: "normal", sm: "nowrap" },
            }}
          >
            {assignment.matchLabel}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexWrap: "wrap",
              mt: 0.75,
              color: COLORS.mutedStrong,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationIcon sx={{ fontSize: 15, color: COLORS.muted }} />
              <Typography sx={{ fontSize: 13 }}>
                {assignment.venueLabel}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: 15, color: COLORS.muted }} />
              <Typography sx={{ fontSize: 13 }}>{dateInfo.time}</Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            gridColumn: { xs: "2 / 3", md: "auto" },
            justifySelf: { xs: "start", md: "end" },
          }}
        >
          <RefereeAssignmentStatusBadge
            status={assignment.status}
            sx={{ gap: 1, px: 1.75, fontWeight: 800 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MatchRow;
