import { Typography } from "@mui/material";

const FormValidationError = ({ children }) => {
  if (!children) return null;
  return (
    <Typography
      sx={{
        color: "#ef4444",
        fontSize: "0.75rem",
        mt: 1,
        textAlign: "left",
        ml: 1.5,
      }}
    >
      {children}
    </Typography>
  );
};

export default FormValidationError;
