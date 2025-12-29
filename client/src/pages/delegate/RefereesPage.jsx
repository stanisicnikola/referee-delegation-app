import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useReferees } from "../../hooks";

const RefereesPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);

  const { data: refereesData, isLoading } = useReferees({ limit: 100 });
  const referees = refereesData?.data || [];

  // Filter referees
  const filteredReferees = referees.filter((referee) => {
    const fullName =
      `${referee.user?.firstName} ${referee.user?.lastName}`.toLowerCase();
    const matchesSearch =
      search === "" || fullName.includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || referee.licenseCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Mock availability status
  const getAvailability = (index) => {
    const statuses = [
      "available",
      "available",
      "available",
      "partial",
      "unavailable",
    ];
    return statuses[index % statuses.length];
  };

  const getAvailabilityStyle = (status) => {
    switch (status) {
      case "available":
        return {
          bg: "rgba(34, 197, 94, 0.1)",
          color: "#22c55e",
          dot: "#22c55e",
          label: "Dostupan",
        };
      case "partial":
        return {
          bg: "rgba(250, 204, 21, 0.1)",
          color: "#facc15",
          dot: "#facc15",
          label: "Djelimično",
        };
      case "unavailable":
        return {
          bg: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          dot: "#ef4444",
          label: "Nedostupan",
        };
      default:
        return {
          bg: "#242428",
          color: "#6b7280",
          dot: "#6b7280",
          label: "N/A",
        };
    }
  };

  const getAvatarColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
      "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
    ];
    return colors[index % colors.length];
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#121214",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#f97316" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  // Stats
  const totalReferees = referees.length;
  const availableCount = referees.filter(
    (_, i) => getAvailability(i) === "available"
  ).length;
  const partialCount = referees.filter(
    (_, i) => getAvailability(i) === "partial"
  ).length;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "rgba(10, 10, 11, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #242428",
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
            >
              Sudije
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Pregled i upravljanje dostupnošću sudija
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Stats */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                px: 3,
                py: 1.5,
                bgcolor: "#121214",
                borderRadius: "12px",
                border: "1px solid #242428",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}
                >
                  {totalReferees}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  Ukupno
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 32, bgcolor: "#242428" }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "20px", fontWeight: 700, color: "#22c55e" }}
                >
                  {availableCount}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  Dostupno
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 32, bgcolor: "#242428" }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "20px", fontWeight: 700, color: "#facc15" }}
                >
                  {partialCount}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  Djelimično
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            placeholder='Pretraži po imenu...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size='small'
            sx={{ ...inputStyles, width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            {["all", "I", "II", "III"].map((category) => (
              <Button
                key={category}
                onClick={() => setCategoryFilter(category)}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  bgcolor: categoryFilter === category ? "#f97316" : "#121214",
                  border: "1px solid",
                  borderColor:
                    categoryFilter === category ? "#f97316" : "#242428",
                  color: categoryFilter === category ? "#fff" : "#9ca3af",
                  fontSize: "14px",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor:
                      categoryFilter === category ? "#ea580c" : "#1a1a1d",
                  },
                }}
              >
                {category === "all"
                  ? "Sve kategorije"
                  : `Kategorija ${category}`}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Referees Grid */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#f97316" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 3,
            }}
          >
            {filteredReferees.map((referee, index) => {
              const availability = getAvailability(index);
              const availStyle = getAvailabilityStyle(availability);
              return (
                <Box
                  key={referee.id}
                  sx={{
                    bgcolor: "#121214",
                    borderRadius: "16px",
                    border: "1px solid #242428",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "#3f3f46",
                    },
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderBottom: "1px solid #242428",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: getAvatarColor(index),
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {referee.user?.firstName?.[0]}
                      {referee.user?.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                          {referee.user?.firstName} {referee.user?.lastName}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={(e) => handleMenuOpen(e, referee)}
                          sx={{ color: "#6b7280" }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Chip
                          icon={
                            <StarIcon sx={{ fontSize: "14px !important" }} />
                          }
                          label={`Kategorija ${
                            referee.licenseCategory || "N/A"
                          }`}
                          size='small'
                          sx={{
                            bgcolor: "rgba(249, 115, 22, 0.1)",
                            color: "#f97316",
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                            fontWeight: 500,
                            fontSize: "12px",
                            height: 24,
                            "& .MuiChip-icon": { color: "#f97316" },
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.25,
                            borderRadius: "6px",
                            bgcolor: availStyle.bg,
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: availStyle.dot,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 500,
                              color: availStyle.color,
                            }}
                          >
                            {availStyle.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#9ca3af",
                        }}
                      >
                        <LocationIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: "14px" }}>
                          {referee.city || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#9ca3af",
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: "14px" }}>
                          {referee.phone || referee.user?.phone || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#9ca3af",
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {referee.user?.email || "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Stats Row */}
                    <Box
                      sx={{
                        mt: 2.5,
                        pt: 2.5,
                        borderTop: "1px solid #242428",
                        display: "flex",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          textAlign: "center",
                          p: 1.5,
                          bgcolor: "#0a0a0b",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {referee.matchesCount ||
                            Math.floor(Math.random() * 30) + 5}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Utakmica
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          textAlign: "center",
                          p: 1.5,
                          bgcolor: "#0a0a0b",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {referee.rating || (4 + Math.random()).toFixed(1)}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Ocjena
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          textAlign: "center",
                          p: 1.5,
                          bgcolor: "#0a0a0b",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#22c55e",
                          }}
                        >
                          {referee.experience ||
                            Math.floor(Math.random() * 10) + 1}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          God. iskustva
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              bgcolor: "#1a1a1d",
              border: "1px solid #242428",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              minWidth: 160,
            },
          }}
        >
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Pogledaj profil
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Pozovi
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              color: "#fff",
              fontSize: "14px",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Pošalji email
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default RefereesPage;
