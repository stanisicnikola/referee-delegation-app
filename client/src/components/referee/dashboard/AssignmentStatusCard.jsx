import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  CheckCircleOutline as CheckIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import { DASHBOARD_COLORS as COLORS } from "./constants";

const AssignmentStatusCard = ({ statistics }) => {
  const statusRows = [
    {
      label: "Accepted",
      value: statistics.accepted || 0,
      color: COLORS.green,
      icon: CheckIcon,
    },
    {
      label: "Pending",
      value: statistics.pending || 0,
      color: COLORS.warning,
      icon: WarningIcon,
    },
    {
      label: "Declined",
      value: statistics.declined || 0,
      color: COLORS.red,
      icon: null,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: "16px",
        bgcolor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Typography sx={{ fontSize: 17, fontWeight: 700, mb: 2 }}>
        Assignment Status
      </Typography>
      <Stack spacing={1.75}>
        {statusRows.map((row) => {
          const Icon = row.icon;
          return (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                {Icon ? (
                  <Icon sx={{ color: row.color, fontSize: 21 }} />
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: `${row.color}24`,
                      color: row.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    x
                  </Box>
                )}
                <Typography sx={{ color: COLORS.mutedStrong, fontWeight: 600 }}>
                  {row.label}
                </Typography>
              </Box>
              <Typography sx={{ color: COLORS.text, fontWeight: 800 }}>
                {row.value}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default AssignmentStatusCard;
