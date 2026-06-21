import { FormControl, Select, MenuItem, Typography } from "@mui/material";
import { panelVariantColors } from "../../theme/theme";

const FilterSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "All Status",
  minWidth = 150,
  variant = "admin",
  sx = {},
  ...props
}) => {
  const accentColor = panelVariantColors[variant] || panelVariantColors.admin;

  const inputStyles = {
    bgcolor: "#1a1a1d",
    borderRadius: "12px",
    height: "50px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#242428",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3f3f46",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accentColor,
    },
    "& .MuiSelect-select": {
      color: value === "all" ? "#6b7280ff" : "#fff",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      py: 0,
      height: "50px",
    },
    ...sx,
  };

  return (
    <FormControl
      sx={{
        width: { xs: "100%", sm: "auto" },
        minWidth: { xs: "100%", sm: minWidth },
        flex: { xs: "none", sm: "none" },
        ...sx,
      }}
    >
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        sx={inputStyles}
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
                  bgcolor: `${accentColor}20`,
                  color: accentColor,
                  "&:hover": {
                    bgcolor: `${accentColor}30`,
                  },
                },
              },
            },
          },
        }}
        {...props}
      >
        <MenuItem value='all'>{placeholder}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterSelect;
