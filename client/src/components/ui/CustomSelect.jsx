import { FormControl, MenuItem, Select, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { panelVariantColors } from "../../theme/theme";
import FormValidationError from "./FormValidationError";

/**
 * Reusable Select component that fits the project's dark theme.
 * Works well with react-hook-form Controller.
 *
 * @param {Array} options - List of options { label: string, value: string, disabled?: boolean }
 * @param {string} label - Label displayed above the select
 * @param {string} placeholder - Placeholder shown when no value is selected
 * @param {object} sx - MUI style overrides for the Select component
 * @param {object} formControlSx - MUI style overrides for the FormControl wrapper
 * @param {string} variant - admin | delegate | referee
 * @param {boolean} error - Error state
 * @param {object} field - react-hook-form field props (from Controller)
 */
const CustomSelect = ({
  options,
  label,
  placeholder = "Select...",
  variant = "admin",
  sx = {},
  formControlSx = {},
  error,
  ...field
}) => {
  const accentColor = panelVariantColors[variant] || panelVariantColors.admin;
  const inputStyles = {
    bgcolor: "#1a1a1d",
    borderRadius: "12px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#242428",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3f3f46",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accentColor,
    },
    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ef4444",
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
    <FormControl fullWidth error={!!error} sx={formControlSx}>
      {label && <Typography sx={labelStyles}>{label}</Typography>}
      <Select
        {...field}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
                {placeholder}
              </Typography>
            );
          }
          const opt = options.find((o) => o.value === selected);
          return (
            <Typography sx={{ color: "#fff", fontSize: "14px" }}>
              {opt ? opt.label : selected}
            </Typography>
          );
        }}
        sx={{
          "& .MuiSelect-select": {
            py: 1.3,
            px: 2,
          },
          ...inputStyles,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "#1a1a1d",
              border: "1px solid #242428",
              borderRadius: "12px",
              mt: 1,
              "& .MuiMenuItem-root": {
                color: "#9ca3af",
                fontSize: "14px",
                "&:hover": {
                  bgcolor: "#242428",
                  color: "#fff",
                },
                "&.Mui-selected": {
                  bgcolor: alpha(accentColor, 0.16),
                  color: accentColor,
                  "&:hover": {
                    bgcolor: alpha(accentColor, 0.22),
                  },
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FormValidationError>{error}</FormValidationError>
    </FormControl>
  );
};

export default CustomSelect;
