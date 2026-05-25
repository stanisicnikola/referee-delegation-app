import { Box, Chip, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Check as AcceptIcon,
  Close as DeclineIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import {
  CustomButton,
  RefereeAssignmentStatusBadge,
  RefereeRoleBadge,
} from "../../ui";
import { SCHEDULE_COLORS as COLORS } from "./constants";

const actionButtonSx = {
  minHeight: 42,
  px: 1.85,
  py: 0.95,
  borderRadius: "10px",
  fontSize: 13,
  fontWeight: 850,
  whiteSpace: "nowrap",
};

const ScheduleAssignmentCard = ({
  assignment,
  isActionPending,
  onAccept,
  onDecline,
}) => {
  const isPending = assignment.status === "pending";
  const showColleagues = assignment.status === "accepted";
  const footerItems = [assignment.roundLabel, assignment.matchNumberLabel].filter(
    Boolean,
  );

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: "hidden",
        borderRadius: "18px",
        bgcolor: COLORS.card,
        border: `1px solid ${
          isPending ? alpha(theme.palette.warning.main, 0.42) : COLORS.border
        }`,
        transition: "background-color 0.16s ease, border-color 0.16s ease",
        "&:hover": {
          bgcolor: COLORS.cardHover,
          borderColor: isPending
            ? alpha(theme.palette.warning.main, 0.56)
            : alpha(theme.palette.common.white, 0.16),
        },
      })}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "124px minmax(0, 1fr) auto",
          },
          gridTemplateAreas: {
            xs: `"date" "content" "actions"`,
            md: `"date content actions"`,
          },
          minHeight: { md: 148 },
        }}
      >
        <DateRail dateInfo={assignment.dateInfo} isPending={isPending} />

        <Box
          sx={{
            gridArea: "content",
            minWidth: 0,
            px: { xs: 2.25, md: 3 },
            py: { xs: 2.25, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mb: 1.35,
            }}
          >
            <ScheduleChip label={assignment.competitionLabel} tone='competition' />
            <RefereeRoleBadge
              role={assignment.role}
              sx={{
                height: 25,
                fontWeight: 900,
                maxWidth: { xs: 180, md: 240 },
              }}
            />
          </Box>

          <Typography
            sx={{
              color: COLORS.text,
              fontWeight: 800,
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {assignment.matchLabel}
          </Typography>

          <VenueMeta venueLabel={assignment.venueLabel} />

          {(showColleagues || footerItems.length > 0) && (
            <CardFooter
              colleagues={assignment.acceptedColleagues || []}
              footerItems={footerItems}
              showColleagues={showColleagues}
            />
          )}
        </Box>

        <Actions
          assignment={assignment}
          isActionPending={isActionPending}
          isPending={isPending}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </Box>
    </Paper>
  );
};

const DateRail = ({ dateInfo, isPending }) => (
  <Box
    sx={(theme) => ({
      gridArea: "date",
      minHeight: { xs: 86, md: "100%" },
      bgcolor: isPending
        ? alpha(theme.palette.warning.main, 0.06)
        : COLORS.panel,
      borderRight: { xs: "none", md: `1px solid ${COLORS.border}` },
      borderBottom: { xs: `1px solid ${COLORS.border}`, md: "none" },
      display: "flex",
      flexDirection: { xs: "row", md: "column" },
      alignItems: "center",
      justifyContent: { xs: "space-between", md: "center" },
      gap: { xs: 1.5, md: 0.25 },
      px: { xs: 2.25, md: 1.5 },
      py: { xs: 1.5, md: 2.25 },
      textAlign: { xs: "left", md: "center" },
    })}
  >
    <Box>
      <Typography
        sx={{
          color: COLORS.mutedStrong,
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0,
        }}
      >
        {dateInfo?.weekday || "---"}
      </Typography>
      <Typography
        sx={{
          color: COLORS.text,
          fontSize: { xs: 30, md: 34 },
          lineHeight: 1,
          fontWeight: 900,
          mt: 0.4,
        }}
      >
        {dateInfo?.day || "--"}
      </Typography>
    </Box>

    <Typography
      sx={{
        color: COLORS.mutedStrong,
        fontSize: { xs: 15, md: 16 },
        fontWeight: 800,
      }}
    >
      {dateInfo?.time || "--:--"}
    </Typography>
  </Box>
);

const VenueMeta = ({ venueLabel }) => (
  <Box
    sx={{
      mt: 1.15,
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      color: COLORS.mutedStrong,
      minWidth: 0,
    }}
  >
    <LocationIcon sx={{ color: COLORS.muted, fontSize: 19 }} />
    <Typography
      sx={{
        fontSize: { xs: 14, md: 15 },
        fontWeight: 650,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: { xs: "normal", sm: "nowrap" },
      }}
    >
      {venueLabel}
    </Typography>
  </Box>
);

const CardFooter = ({ colleagues, footerItems, showColleagues }) => (
  <Box
    sx={{
      mt: 2.15,
      pt: 1.75,
      borderTop: `1px solid ${COLORS.borderSoft}`,
      display: "flex",
      alignItems: "center",
      gap: 2,
      flexWrap: "wrap",
      color: COLORS.mutedStrong,
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    {showColleagues && <ColleaguesInfo colleagues={colleagues} />}
    {showColleagues && footerItems.length > 0 && <FooterDot />}
    {footerItems.map((item, index) => (
      <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {index > 0 && <FooterDot />}
        <span>{item}</span>
      </Box>
    ))}
  </Box>
);

const Actions = ({
  assignment,
  isActionPending,
  isPending,
  onAccept,
  onDecline,
}) => (
  <Box
    sx={{
      gridArea: "actions",
      px: { xs: 2.25, md: 3 },
      pb: { xs: 2.25, md: 0 },
      py: { md: 3 },
      display: "flex",
      alignItems: { xs: "stretch", md: "center" },
      justifyContent: { xs: "flex-start", md: "flex-end" },
      minWidth: { md: isPending ? 218 : 154 },
    }}
  >
    {isPending ? (
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <CustomButton
          variant='referee-decline'
          startIcon={<DeclineIcon />}
          disabled={isActionPending}
          onClick={(event) => onDecline(event, assignment)}
          sx={actionButtonSx}
        >
          Decline
        </CustomButton>
        <CustomButton
          variant='referee-accept'
          startIcon={<AcceptIcon />}
          disabled={isActionPending}
          onClick={() => onAccept(assignment)}
          sx={actionButtonSx}
        >
          Accept
        </CustomButton>
      </Box>
    ) : (
      <RefereeAssignmentStatusBadge status={assignment.status} showAcceptedIcon />
    )}
  </Box>
);

const ColleaguesInfo = ({ colleagues }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography component='span' sx={{ fontSize: 13, fontWeight: 800 }}>
      Colleagues:
    </Typography>
    {colleagues.length > 0 ? (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {colleagues.map((colleague, index) => (
          <Box
            key={colleague.id}
            title={colleague.name}
            sx={(theme) => ({
              width: 30,
              height: 30,
              ml: index === 0 ? 0 : -0.65,
              borderRadius: "50%",
              border: `2px solid ${COLORS.card}`,
              bgcolor:
                index % 2 === 0
                  ? theme.palette.refereeRoleColors.second
                  : theme.palette.refereeRoleColors.first,
              color: theme.palette.common.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              lineHeight: 1,
            })}
          >
            {colleague.initials}
          </Box>
        ))}
      </Box>
    ) : (
      <Typography
        component='span'
        sx={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}
      >
        None
      </Typography>
    )}
  </Box>
);

const FooterDot = () => (
  <Box
    sx={{
      width: 4,
      height: 4,
      borderRadius: "50%",
      bgcolor: COLORS.muted,
      flexShrink: 0,
    }}
  />
);

const ScheduleChip = ({ label, tone }) => (
  <Chip
    size='small'
    label={label}
    sx={(theme) => {
      const isCompetition = tone === "competition";

      return {
        height: 25,
        borderRadius: "7px",
        bgcolor: isCompetition
          ? alpha(COLORS.orange, 0.16)
          : alpha(theme.palette.common.white, 0.08),
        color: isCompetition ? COLORS.orange : COLORS.mutedStrong,
        fontSize: 12,
        fontWeight: 900,
        maxWidth: { xs: 180, md: 240 },
        "& .MuiChip-label": {
          px: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      };
    }}
  />
);

export default ScheduleAssignmentCard;
