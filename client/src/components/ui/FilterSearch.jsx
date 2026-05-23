import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { panelVariantColors } from "../../theme/theme";

const FilterSearch = ({
  placeholder = "Search...",
  value,
  onChange,
  variant = "admin",
  sx = {},
  ...props
}) => {
  const accentColor =
    panelVariantColors[variant] || panelVariantColors.admin;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      height: "50px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: accentColor },
      "&.Mui-focused .MuiSvgIcon-root": { color: accentColor },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      "&::placeholder": {
        color: "#6b7280",
        opacity: 1,
      },
    },
    ...sx,
  };

  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: "#6b7280", fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        flex: 1,
        width: { xs: "100%", sm: "auto" },
        minWidth: { xs: "100%", sm: 200 },
        maxWidth: { xs: "none", sm: 400 },
        ...inputStyles,
      }}
      {...props}
    />
  );
};

export default FilterSearch;
