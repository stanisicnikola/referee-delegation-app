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
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
            }}
          >
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
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "stretch", sm: "flex-end" },
          }}
        >
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
            <CustomButton
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{
                width: { xs: "100%", sm: "auto" },
                justifyContent: "center",
              }}
            >
              {addLabel}
            </CustomButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;
