import { Box } from "@mui/material";
import { FilterSearch, FilterSelect } from "../../ui";

const DelegateMatchesFilters = ({
  search,
  competitionFilter,
  statusFilter,
  competitions,
  onSearchChange,
  onCompetitionChange,
  onStatusChange,
}) => (
  <Box
    sx={{
      p: 2,
      mb: 3,
      bgcolor: "#121214",
      border: "1px solid #242428",
      borderRadius: "16px",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      flexWrap: { sm: "wrap" },
      alignItems: { xs: "stretch", sm: "center" },
      gap: 2,
    }}
  >
    <FilterSearch
      variant='delegate'
      placeholder='Search matches...'
      value={search}
      onChange={onSearchChange}
      sx={{
        flex: { sm: "1 1 280px" },
        maxWidth: { xs: "none", sm: 460 },
      }}
    />

    <FilterSelect
      variant='delegate'
      value={competitionFilter}
      onChange={onCompetitionChange}
      placeholder='All competitions'
      minWidth={180}
      options={competitions.map((competition) => ({
        value: competition.id,
        label: competition.name,
      }))}
    />

    <FilterSelect
      variant='delegate'
      value={statusFilter}
      onChange={onStatusChange}
      placeholder='All statuses'
      minWidth={180}
      options={[
        { value: "pending", label: "Pending" },
        { value: "partial", label: "Partial" },
        { value: "complete", label: "Assigned" },
        { value: "confirmed", label: "Confirmed" },
      ]}
    />
  </Box>
);

export default DelegateMatchesFilters;
