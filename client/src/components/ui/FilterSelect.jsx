import { FormControl, Select, MenuItem, Typography } from "@mui/material";

const FilterSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "All Status",
  minWidth = 150,
  sx = {},
  ...props
}) => {
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
      borderColor: "#8b5cf6",
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
    <FormControl sx={{ minWidth, ...sx }}>
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
