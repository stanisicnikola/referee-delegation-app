import { TextField, Typography, Box } from "@mui/material";
import FormValidationError from "./FormValidationError";
import loginTheme from "../../theme/theme";

/**
 * Reusable Input component that fits the project's dark theme.
 * Works well with react-hook-form Controller.
 *
 * @param {string} label - Label displayed above the input
 * @param {string} error - Error message (if any)
 * @param {object} sx - MUI style overrides for the TextField
 * @param {object} field - react-hook-form field props (from Controller)
 */
const CustomInput = ({
  label,
  placeholder,
  type,
  error,
  sx = {},
  ...props
}) => {
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
      "&.Mui-error fieldset": { borderColor: "#ef4444" },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      py: 1.5,
      px: 2,
    },
    ...sx,
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };

  return (
    <Box sx={{ width: "100%" }}>
      {label && <Typography sx={labelStyles}>{label}</Typography>}
      <TextField
        fullWidth
        placeholder={placeholder}
        error={!!error}
        type={type}
        sx={type === "login" ? loginTheme.components.MuiTextField : inputStyles}
        variant='outlined'
        {...props}
      />
      <FormValidationError>{error}</FormValidationError>
    </Box>
  );
};

export default CustomInput;
