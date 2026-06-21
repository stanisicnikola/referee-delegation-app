import { Box } from "@mui/material";
import { CustomButton } from "../../ui";
import { AVAILABILITY_REQUEST_STATUS_FILTERS } from "./availabilityRequestUtils";

const AvailabilityRequestFilters = ({ value, onChange }) => (
  <Box
    sx={{
      mb: 3,
      display: "flex",
      gap: 1,
      overflowX: "auto",
      pb: 0.5,
      WebkitOverflowScrolling: "touch",
      "&::-webkit-scrollbar": { height: 6 },
      "&::-webkit-scrollbar-thumb": {
        bgcolor: "#2e2e33",
        borderRadius: "9999px",
      },
    }}
  >
    {AVAILABILITY_REQUEST_STATUS_FILTERS.map((filter) => {
      const selected = value === filter.value;

      return (
        <CustomButton
          key={filter.value}
          variant='outline'
          onClick={() => onChange(filter.value)}
          sx={{
            bgcolor: selected ? "#f97316" : "#121214",
            borderColor: selected ? "#f97316" : "#242428",
            color: selected ? "#fff" : "#9ca3af",
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: selected ? "#ea580c" : "#1a1a1d",
            },
          }}
        >
          {filter.label}
        </CustomButton>
      );
    })}
  </Box>
);

export default AvailabilityRequestFilters;
