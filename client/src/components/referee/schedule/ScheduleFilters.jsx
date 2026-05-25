import { useMemo } from "react";
import { Box } from "@mui/material";
import { FilterSelect } from "../../ui";
import { REFEREE_ROLE_OPTIONS } from "../../../utils/refereeAssignmentBadges";
import { SCHEDULE_PERIOD_OPTIONS } from "./constants";

const ScheduleFilters = ({
  competitions,
  selectedCompetition,
  selectedRole,
  selectedPeriod,
  onCompetitionChange,
  onRoleChange,
  onPeriodChange,
}) => {
  const competitionOptions = useMemo(() => {
    const options = new Map();

    competitions.forEach((competition) => {
      if (competition?.id) {
        options.set(String(competition.id), {
          value: competition.id,
          label: competition.name,
        });
      }
    });

    return Array.from(options.values()).sort((first, second) =>
      first.label.localeCompare(second.label),
    );
  }, [competitions]);

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        mb: 3,
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.grey[600]}`,
        borderRadius: "16px",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: { sm: "wrap" },
        alignItems: "center",
        gap: 2,
      })}
    >
      <FilterSelect
        variant='referee'
        value={selectedCompetition}
        onChange={onCompetitionChange}
        placeholder='All Competitions'
        minWidth={260}
        options={competitionOptions}
      />

      <FilterSelect
        variant='referee'
        value={selectedRole}
        onChange={onRoleChange}
        placeholder='All Roles'
        minWidth={220}
        options={REFEREE_ROLE_OPTIONS}
      />

      <FilterSelect
        variant='referee'
        value={selectedPeriod}
        onChange={onPeriodChange}
        placeholder='All Matches'
        minWidth={220}
        options={SCHEDULE_PERIOD_OPTIONS}
      />
    </Box>
  );
};

export default ScheduleFilters;
