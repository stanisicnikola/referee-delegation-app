import { Box, Chip, Paper, Typography } from "@mui/material";
import {
  Check as AcceptIcon,
  Close as DeclineIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { CustomButton, RefereeRoleBadge } from "../../ui";
import { PENDING_COLORS as COLORS } from "./constants";

const PendingAssignmentCard = ({
  assignment,
  isActionPending,
  isAccepting,
  isDeclining,
  onAccept,
  onDecline,
}) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "20px",
      bgcolor: COLORS.card,
      border: "1px solid rgba(234, 179, 8, 0.36)",
      p: { xs: 2.25, sm: 3, md: 3.5 },
      transition:
        "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease",
      "&:hover": {
        borderColor: "rgba(234, 179, 8, 0.55)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
      },
    }}
  >
    <Box
      sx={{
        mb: 3,
        display: "grid",
        gridTemplateColumns: {
          xs: "82px minmax(0, 1fr)",
          sm: "98px minmax(0, 1fr)",
          md: "98px minmax(0, 1fr) auto",
        },
        gridTemplateAreas: {
          xs: `"date chips" "details details" "time time"`,
          sm: `"date content" "time content"`,
          md: `"date content time"`,
        },
        gap: { xs: 1.75, md: 2.5 },
        alignItems: "start",
      }}
    >
      <DateTile dateInfo={assignment.dateInfo} />

      <DetailChips chips={assignment.detailChips || []} mobile />

      <MatchHeaderInfo assignment={assignment} />

      <TimeBlock dateInfo={assignment.dateInfo} />
    </Box>

    <RolePanel assignment={assignment} />

    {assignment.otherReferees?.length > 0 && (
      <OtherRefereesSection referees={assignment.otherReferees} />
    )}

    <Box
      sx={{
        mt: 3,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 1.25,
      }}
    >
      <CustomButton
        variant='referee-decline'
        loading={isDeclining}
        disabled={isActionPending}
        startIcon={isDeclining ? null : <DeclineIcon />}
        onClick={(event) => onDecline(event, assignment)}
      >
        Decline
      </CustomButton>
      <CustomButton
        variant='referee-accept'
        loading={isAccepting}
        disabled={isActionPending}
        startIcon={isAccepting ? null : <AcceptIcon />}
        onClick={() => onAccept(assignment)}
      >
        Accept
      </CustomButton>
    </Box>
  </Paper>
);

const DetailChips = ({ chips, mobile = false }) => {
  if (chips.length === 0) return null;

  return (
    <Box
      sx={{
        gridArea: mobile ? "chips" : "auto",
        display: {
          xs: mobile ? "flex" : "none",
          sm: mobile ? "none" : "flex",
        },
        alignItems: "center",
        alignSelf: "start",
        gap: 1,
        flexWrap: "wrap",
        mb: mobile ? 0 : 1.2,
        minWidth: 0,
      }}
    >
      {chips.map((chip) => (
        <TinyChip
          key={chip.label}
          label={chip.label}
          color={chip.tone === "competition" ? COLORS.blue : COLORS.mutedStrong}
          bg={
            chip.tone === "competition"
              ? "rgba(96, 165, 250, 0.15)"
              : "rgba(255, 255, 255, 0.08)"
          }
        />
      ))}
    </Box>
  );
};

const MatchHeaderInfo = ({ assignment }) => (
  <Box
    sx={{
      gridArea: { xs: "details", sm: "content" },
      minWidth: 0,
    }}
  >
    <DetailChips chips={assignment.detailChips || []} />

    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: "1.2rem", md: "1.35rem" },
        lineHeight: 1.25,
        fontWeight: 900,
        overflowWrap: "anywhere",
      }}
    >
      {assignment.matchLabel}
    </Typography>

    <Box
      sx={{
        mt: 1.2,
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        flexWrap: "wrap",
        color: COLORS.mutedStrong,
      }}
    >
      <MetaItem icon={<LocationIcon />} label={assignment.venueLabel} />
    </Box>
  </Box>
);

const TimeBlock = ({ dateInfo }) => (
  <Box
    sx={{
      gridArea: "time",
      justifySelf: { xs: "start", md: "end" },
      textAlign: { xs: "left", md: "right" },
      minWidth: { md: 128 },
    }}
  >
    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: 30, md: 34 },
        lineHeight: 1,
        fontWeight: 900,
      }}
    >
      {dateInfo.time}
    </Typography>
    <Typography
      sx={{
        mt: 1,
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {dateInfo.displayDate}
    </Typography>
  </Box>
);

const RolePanel = ({ assignment }) => (
  <Box
    sx={{
      p: { xs: 2, md: 2.25 },
      borderRadius: "16px",
      bgcolor: COLORS.panel,
    }}
  >
    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: 14,
        fontWeight: 850,
        mb: 1.75,
      }}
    >
      Your role on this match:
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 58,
          height: 58,
          borderRadius: "14px",
          bgcolor: "rgba(255, 255, 255, 0.06)",
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 25,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {assignment.roleNumber}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <RefereeRoleBadge
          role={assignment.role}
          sx={{
            height: 28,
            borderRadius: "8px",
            fontWeight: 850,
            maxWidth: { xs: "100%", sm: 220 },
          }}
        />
        {assignment.delegateLabel && (
          <Typography
            sx={{
              mt: 0.7,
              color: COLORS.muted,
              fontSize: 14,
              fontWeight: 750,
              overflowWrap: "anywhere",
            }}
          >
            Assigned by: {assignment.delegateLabel} (Delegate)
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

const OtherRefereesSection = ({ referees }) => (
  <Box sx={{ mt: 2.75 }}>
    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: 14,
        fontWeight: 850,
        mb: 1.25,
      }}
    >
      Other referees:
    </Typography>
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        flexWrap: "wrap",
      }}
    >
      {referees.map((referee) => (
        <RefereeMiniCard key={referee.id} referee={referee} />
      ))}
    </Box>
  </Box>
);

const RefereeMiniCard = ({ referee }) => (
  <Box
    sx={{
      minWidth: { xs: "100%", sm: 210 },
      maxWidth: { sm: 250 },
      px: 1.5,
      py: 1.25,
      borderRadius: "10px",
      bgcolor: "rgba(255, 255, 255, 0.04)",
      display: "flex",
      alignItems: "center",
      gap: 1.2,
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        bgcolor: "rgba(255, 255, 255, 0.08)",
        color: COLORS.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {referee.initials}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: COLORS.text,
          fontSize: 14,
          fontWeight: 900,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {referee.name}
      </Typography>
      <RefereeRoleBadge
        role={referee.role}
        label={referee.roleLabel}
        sx={{
          mt: 0.5,
          height: 22,
          borderRadius: "6px",
          fontSize: 11,
          maxWidth: 150,
        }}
      />
    </Box>
  </Box>
);

const DateTile = ({ dateInfo }) => (
  <Box
    sx={{
      gridArea: "date",
      width: { xs: 82, sm: 98 },
      minHeight: { xs: 88, sm: 98 },
      borderRadius: "16px",
      bgcolor: "rgba(234, 179, 8, 0.12)",
      border: "1px solid rgba(234, 179, 8, 0.24)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.35,
      px: 1,
      py: { xs: 1.1, sm: 1.5 },
      textAlign: "center",
    }}
  >
    <Typography
      sx={{
        color: COLORS.warning,
        fontSize: 12,
        fontWeight: 850,
        lineHeight: 1,
        textTransform: "uppercase",
      }}
    >
      {dateInfo.weekday}
    </Typography>
    <Typography
      sx={{
        color: COLORS.text,
        fontSize: { xs: 34, sm: 36 },
        lineHeight: 1,
        fontWeight: 900,
        mt: 0.65,
      }}
    >
      {dateInfo.day}
    </Typography>
  </Box>
);

const MetaItem = ({ icon, label }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.6,
      minWidth: 0,
      maxWidth: { xs: "100%", lg: 380 },
    }}
  >
    <Box
      component='span'
      sx={{
        display: "inline-flex",
        color: COLORS.muted,
        "& .MuiSvgIcon-root": { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography
      component='span'
      sx={{
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: 650,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: { xs: "normal", sm: "nowrap" },
      }}
    >
      {label}
    </Typography>
  </Box>
);

const TinyChip = ({
  label,
  color = COLORS.mutedStrong,
  bg = "rgba(255, 255, 255, 0.08)",
}) => (
  <Chip
    size='small'
    label={label}
    sx={{
      height: 28,
      borderRadius: "8px",
      bgcolor: bg,
      color,
      fontSize: 12,
      fontWeight: 850,
      maxWidth: { xs: "100%", sm: 220 },
      "& .MuiChip-label": {
        px: 1.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }}
  />
);

export default PendingAssignmentCard;
