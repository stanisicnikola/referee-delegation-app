import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

const SearchFilter = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  showClearButton = true,
}) => {
  const hasActiveFilters =
    searchValue || Object.values(filterValues).some((v) => v);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        mb: 3,
      }}
    >
      {/* Search field */}
      <TextField
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        size='small'
        sx={{
          minWidth: 300,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Filter fields */}
      {filters.map((filter) => (
        <TextField
          key={filter.id}
          select
          label={filter.label}
          value={filterValues[filter.id] || ""}
          onChange={(e) => onFilterChange(filter.id, e.target.value)}
          size='small'
          sx={{
            minWidth: filter.width || 150,
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
            },
          }}
        >
          <MenuItem value=''>All</MenuItem>
          {filter.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ))}

      {/* Clear filters button */}
      {showClearButton && hasActiveFilters && (
        <Tooltip title='Clear all filters'>
          <IconButton
            onClick={onClearFilters}
            size='small'
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ClearIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default SearchFilter;
