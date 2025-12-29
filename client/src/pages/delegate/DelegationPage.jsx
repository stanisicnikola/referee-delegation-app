import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useMatch, useReferees, useDelegateReferees } from "../../hooks";

const DelegationPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedReferees, setAssignedReferees] = useState({
    main: null,
    second: null,
    third: null,
  });

  const { data: matchData, isLoading: matchLoading } = useMatch(matchId);
  const { data: refereesData, isLoading: refereesLoading } = useReferees({
    limit: 100,
  });
  const delegateReferees = useDelegateReferees();

  const match = matchData?.data || matchData;
  const allReferees = refereesData?.data || [];

  // Filter referees based on search
  const availableReferees = allReferees.filter((referee) => {
    const fullName =
      `${referee.user?.firstName} ${referee.user?.lastName}`.toLowerCase();
    const matchesSearch =
      search === "" || fullName.includes(search.toLowerCase());
    const notAssigned = !Object.values(assignedReferees).some(
      (r) => r?.id === referee.id
    );
    return matchesSearch && notAssigned;
  });

  // Split into available and unavailable (mock for now)
  const available = availableReferees.filter((_, i) => i % 5 !== 4);
  const unavailable = availableReferees.filter((_, i) => i % 5 === 4);

  const handleAssign = (referee, slot) => {
    setAssignedReferees((prev) => ({
      ...prev,
      [slot]: referee,
    }));
  };

  const handleRemove = (slot) => {
    setAssignedReferees((prev) => ({
      ...prev,
      [slot]: null,
    }));
  };

  const handleConfirmDelegation = async () => {
    try {
      const refereeIds = [];
      if (assignedReferees.main) refereeIds.push(assignedReferees.main.id);
      if (assignedReferees.second) refereeIds.push(assignedReferees.second.id);
      if (assignedReferees.third) refereeIds.push(assignedReferees.third.id);

      await delegateReferees.mutateAsync({
        matchId,
        data: { refereeIds, notes },
      });
      navigate("/delegate/matches");
    } catch (error) {
      console.error("Error confirming delegation:", error);
    }
  };

  const isLoading = matchLoading || refereesLoading;

  const formatDate = (dateString) => {
    if (!dateString) return { day: "-", month: "-", time: "-" };
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Maj",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dec",
    ];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      time: date.toLocaleTimeString("bs-BA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
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
      bgcolor: "#1a1a1d",
      borderRadius: "8px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#f97316" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#f97316" }} />
      </Box>
    );
  }

  const dateInfo = formatDate(match?.dateTime);

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate("/delegate/matches")}
              sx={{ color: "#9ca3af", "&:hover": { bgcolor: "#242428" } }}
            >
              <BackIcon />
            </IconButton>
            <Box>
              <Typography
                sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
              >
                Delegiranje sudija
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                {match?.homeTeam?.name || "TBA"} vs{" "}
                {match?.awayTeam?.name || "TBA"} • {dateInfo.day}.{" "}
                {dateInfo.month} {dateInfo.year}, {dateInfo.time}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<CheckIcon />}
            onClick={handleConfirmDelegation}
            disabled={
              !assignedReferees.main &&
              !assignedReferees.second &&
              !assignedReferees.third
            }
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#f97316",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { bgcolor: "#ea580c" },
              "&:disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
            }}
          >
            Potvrdi delegaciju
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 4 }}>
          {/* Left Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Match Info Card */}
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                {/* Home Team */}
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "24px",
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    {match?.homeTeam?.shortName ||
                      match?.homeTeam?.name?.substring(0, 3).toUpperCase() ||
                      "HOM"}
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                    {match?.homeTeam?.name || "TBA"}
                  </Typography>
                  <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                    Domaćin
                  </Typography>
                </Box>

                {/* VS */}
                <Box sx={{ textAlign: "center", px: 4 }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    {match?.competition?.name || "Liga"} • Kolo{" "}
                    {match?.round || "-"}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "40px", fontWeight: 700, color: "#3f3f46" }}
                  >
                    VS
                  </Typography>
                  <Typography
                    sx={{ fontSize: "14px", color: "#9ca3af", mt: 1 }}
                  >
                    {dateInfo.day}. {dateInfo.month} {dateInfo.year}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "18px", fontWeight: 600, color: "#f97316" }}
                  >
                    {dateInfo.time}
                  </Typography>
                </Box>

                {/* Away Team */}
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "24px",
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    {match?.awayTeam?.shortName ||
                      match?.awayTeam?.name?.substring(0, 3).toUpperCase() ||
                      "AWY"}
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "#fff" }}>
                    {match?.awayTeam?.name || "TBA"}
                  </Typography>
                  <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                    Gost
                  </Typography>
                </Box>
              </Box>

              {/* Venue */}
              <Box
                sx={{
                  mt: 3,
                  pt: 3,
                  borderTop: "1px solid #242428",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  color: "#9ca3af",
                }}
              >
                <LocationIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "14px" }}>
                  {match?.venue?.name || "TBA"}, {match?.venue?.city || ""}
                </Typography>
              </Box>
            </Box>

            {/* Delegation Slots */}
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
              }}
            >
              <Box sx={{ p: 3, borderBottom: "1px solid #242428" }}>
                <Typography
                  sx={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}
                >
                  Sudijska trojka
                </Typography>
                <Typography
                  sx={{ fontSize: "14px", color: "#6b7280", mt: 0.5 }}
                >
                  Dodijelite tri sudije za ovu utakmicu
                </Typography>
              </Box>
              <Box
                sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Slot 1 - Main Referee */}
                <RefereeSlot
                  number={1}
                  label='GLAVNI SUDIJA'
                  referee={assignedReferees.main}
                  onRemove={() => handleRemove("main")}
                  isMain
                />

                {/* Slot 2 - Second Referee */}
                <RefereeSlot
                  number={2}
                  label='2. SUDIJA'
                  referee={assignedReferees.second}
                  onRemove={() => handleRemove("second")}
                />

                {/* Slot 3 - Third Referee */}
                <RefereeSlot
                  number={3}
                  label='3. SUDIJA'
                  referee={assignedReferees.third}
                  onRemove={() => handleRemove("third")}
                />
              </Box>
            </Box>

            {/* Notes */}
            <Box
              sx={{
                bgcolor: "#121214",
                borderRadius: "16px",
                border: "1px solid #242428",
                p: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  mb: 1.5,
                }}
              >
                Napomene za sudije
              </Typography>
              <TextField
                multiline
                rows={3}
                placeholder='Unesite eventualne napomene...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                sx={{
                  ...inputStyles,
                  "& .MuiOutlinedInput-root": {
                    ...inputStyles["& .MuiOutlinedInput-root"],
                    borderRadius: "12px",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Right Column - Available Referees */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              height: "fit-content",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid #242428" }}>
              <TextField
                placeholder='Pretraži sudije...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ p: 1, maxHeight: 600, overflowY: "auto" }}>
              <Typography
                sx={{
                  px: 1.5,
                  py: 1,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Dostupni sudije
              </Typography>

              {available.map((referee, index) => (
                <RefereeCard
                  key={referee.id}
                  referee={referee}
                  color={getAvatarColor(index)}
                  available
                  onAssign={(slot) => handleAssign(referee, slot)}
                  slots={assignedReferees}
                />
              ))}

              {unavailable.length > 0 && (
                <>
                  <Typography
                    sx={{
                      px: 1.5,
                      py: 1,
                      mt: 2,
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Nedostupni
                  </Typography>

                  {unavailable.map((referee) => (
                    <RefereeCard
                      key={referee.id}
                      referee={referee}
                      color='linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      available={false}
                    />
                  ))}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Referee Slot Component
const RefereeSlot = ({ number, label, referee, onRemove, isMain }) => {
  if (referee) {
    return (
      <Box
        sx={{
          border: "2px solid rgba(34, 197, 94, 0.3)",
          bgcolor: "rgba(34, 197, 94, 0.05)",
          borderRadius: "12px",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            {referee.user?.firstName?.[0]}
            {referee.user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Box
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  bgcolor: "#242428",
                  px: 1,
                  py: 0.25,
                  borderRadius: "4px",
                }}
              >
                {label}
              </Box>
              <Typography sx={{ fontSize: "12px", color: "#22c55e" }}>
                ✓ Dodijeljen
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 500, color: "#fff" }}>
              {referee.user?.firstName} {referee.user?.lastName}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Kategorija {referee.licenseCategory || "N/A"} •{" "}
              {referee.city || "N/A"}
            </Typography>
          </Box>
          <IconButton
            onClick={onRemove}
            sx={{
              color: "#6b7280",
              "&:hover": { bgcolor: "#242428", color: "#ef4444" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "2px dashed #2e2e33",
        borderRadius: "12px",
        p: 2,
        transition: "all 0.2s",
        "&:hover": { borderColor: "rgba(249, 115, 22, 0.5)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "12px",
            bgcolor: isMain ? "rgba(249, 115, 22, 0.1)" : "#242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "18px",
              color: isMain ? "#f97316" : "#6b7280",
            }}
          >
            {number}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 600,
              color: isMain ? "#f97316" : "#9ca3af",
              bgcolor: isMain ? "rgba(249, 115, 22, 0.1)" : "#242428",
              px: 1,
              py: 0.25,
              borderRadius: "4px",
              mb: 0.5,
            }}
          >
            {label}
          </Box>
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            Prevucite sudiju ovdje ili kliknite za odabir
          </Typography>
        </Box>
        <Button
          size='small'
          sx={{
            px: 2,
            py: 1,
            borderRadius: "8px",
            bgcolor: "#242428",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": { bgcolor: "#2e2e33" },
          }}
        >
          Odaberi
        </Button>
      </Box>
    </Box>
  );
};

// Referee Card Component
const RefereeCard = ({ referee, color, available, onAssign, slots }) => {
  const [showSlotPicker, setShowSlotPicker] = useState(false);

  const handleClick = () => {
    if (available && onAssign) {
      setShowSlotPicker(true);
    }
  };

  const handleAssignToSlot = (slot) => {
    onAssign(slot);
    setShowSlotPicker(false);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          borderRadius: "12px",
          cursor: available ? "pointer" : "not-allowed",
          opacity: available ? 1 : 0.5,
          transition: "all 0.2s",
          "&:hover": available
            ? { bgcolor: "#1a1a1d", transform: "translateX(4px)" }
            : {},
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: color,
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {referee.user?.firstName?.[0]}
          {referee.user?.lastName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {referee.user?.firstName} {referee.user?.lastName}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
            {available
              ? `Kategorija ${referee.licenseCategory || "N/A"} • ${
                  referee.city || "N/A"
                }`
              : "Nedostupan"}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: available ? "#22c55e" : "#ef4444",
          }}
        />
      </Box>

      {/* Slot Picker Dropdown */}
      {showSlotPicker && (
        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: "100%",
            mt: 0.5,
            bgcolor: "#1a1a1d",
            border: "1px solid #242428",
            borderRadius: "8px",
            overflow: "hidden",
            zIndex: 10,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {[
            { slot: "main", label: "Glavni sudija" },
            { slot: "second", label: "2. Sudija" },
            { slot: "third", label: "3. Sudija" },
          ].map(({ slot, label }) => (
            <Box
              key={slot}
              onClick={() => handleAssignToSlot(slot)}
              sx={{
                px: 2,
                py: 1.5,
                fontSize: "14px",
                color: slots?.[slot] ? "#6b7280" : "#fff",
                cursor: slots?.[slot] ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                "&:hover": slots?.[slot] ? {} : { bgcolor: "#242428" },
              }}
            >
              {label} {slots?.[slot] && "(zauzeto)"}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DelegationPage;
