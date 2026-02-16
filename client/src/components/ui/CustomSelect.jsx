import { FormControl, MenuItem, Select, Typography } from "@mui/material";

/**
 * Reusable Select component that fits the project's dark theme.
 * Works well with react-hook-form Controller.
 *
 * @param {Array} options - List of options { label: string, value: string, disabled?: boolean }
 * @param {string} label - Label displayed above the select
 * @param {string} placeholder - Placeholder shown when no value is selected
 * @param {object} sx - MUI style overrides for the Select component
 * @param {object} formControlSx - MUI style overrides for the FormControl wrapper
 * @param {boolean} error - Error state
 * @param {object} field - react-hook-form field props (from Controller)
 */
const CustomSelect = ({
  options,
  label,
  placeholder = "Select...",
  sx = {},
  formControlSx = {},
  error = false,
  ...field
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
    ...sx,
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };

  return (
    <FormControl fullWidth error={error} sx={formControlSx}>
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
                  bgcolor: "#8b5cf620",
                  color: "#8b5cf6",
                  "&:hover": {
                    bgcolor: "#8b5cf630",
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
    </FormControl>
  );
};

export default CustomSelect;
