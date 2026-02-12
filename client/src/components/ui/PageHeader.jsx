import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Refresh as RefreshIcon, Add as AddIcon } from "@mui/icons-material";
import CustomButton from "./CustomButton";

const PageHeader = ({
  title,
  subtitle,
  onRefresh,
  onAdd,
  addLabel = "New",
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h3' sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant='body2'
              sx={(theme) => ({ color: theme.palette.text.disabled, mt: 1 })}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {onRefresh && (
            <Tooltip title='Refresh'>
              <IconButton
                onClick={onRefresh}
                sx={{
                  bgcolor: "#1a1a1d",
                  border: "1px solid #242428",
                  borderRadius: "12px",
                  color: "#9ca3af",
                  "&:hover": { bgcolor: "#242428", color: "#fff" },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          {onAdd && (
            <CustomButton startIcon={<AddIcon />} onClick={onAdd}>
              {addLabel}
            </CustomButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;
