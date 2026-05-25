import { Box, Stack, Typography } from "@mui/material";
import ScheduleAssignmentCard from "./ScheduleAssignmentCard";
import { SCHEDULE_COLORS as COLORS } from "./constants";

const pluralizeMatches = (count) => `${count} match${count === 1 ? "" : "es"}`;

const ScheduleAssignmentList = ({
  groups,
  isActionPending,
  onAccept,
  onDecline,
}) => (
  <Stack spacing={4.25}>
    {groups.map((group) => (
      <Box key={group.id}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              color: COLORS.text,
              fontSize: { xs: "1.08rem", md: "1.25rem" },
              fontWeight: 800,
            }}
          >
            {group.name}
          </Typography>
          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: { xs: "0.86rem", md: "0.92rem" },
              fontWeight: 700,
            }}
          >
            ({pluralizeMatches(group.matches.length)})
          </Typography>
        </Box>

        <Stack spacing={1.75}>
          {group.matches.map((assignment) => (
            <ScheduleAssignmentCard
              key={assignment.id || assignment.matchId}
              assignment={assignment}
              isActionPending={isActionPending}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))}
        </Stack>
      </Box>
    ))}
  </Stack>
);

export default ScheduleAssignmentList;
