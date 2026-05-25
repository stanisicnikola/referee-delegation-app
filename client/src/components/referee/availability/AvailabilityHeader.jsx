import { Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { CustomButton, PageHeader } from "../../ui";

const AvailabilityHeader = ({ onReport }) => (
  <Box
    sx={{
      mb: 4,
      display: "flex",
      alignItems: { xs: "stretch", sm: "flex-start" },
      justifyContent: "space-between",
      gap: 2,
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    <PageHeader
      title='My Availability'
      subtitle=' Review your unavailable periods and monthly match calendar.'
    />

    <CustomButton
      variant='referee-primary'
      startIcon={<AddIcon />}
      onClick={onReport}
      sx={{
        width: { xs: "100%", sm: "auto" },
        justifyContent: "center",
        whiteSpace: "nowrap",
      }}
    >
      Report unavailability
    </CustomButton>
  </Box>
);

export default AvailabilityHeader;
