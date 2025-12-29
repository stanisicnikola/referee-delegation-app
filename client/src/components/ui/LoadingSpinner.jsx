import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({ message = "Loading...", fullPage = false }) => {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 4,
      }}
    >
      <CircularProgress
        size={40}
        sx={{
          color: "primary.main",
        }}
      />
      {message && (
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
