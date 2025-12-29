import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  useTeams,
  useVenues,
  useCompetitions,
  useReferees,
  useUsers,
} from "../../hooks";

const MatchModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editMatch = null,
}) => {
  const [formData, setFormData] = useState({
    competitionId: "",
    homeTeamId: "",
    awayTeamId: "",
    venueId: "",
    date: "",
    time: "",
    notes: "",
    mainRefereeId: "",
    assistantReferee1Id: "",
    assistantReferee2Id: "",
    delegateId: "",
  });

  const [errors, setErrors] = useState({});

  const { data: teamsData } = useTeams({ limit: 100 });
  const { data: venuesData } = useVenues({ limit: 100 });
  const { data: competitionsData } = useCompetitions({ limit: 100 });
  const { data: refereesData } = useReferees({ limit: 100 });
  const { data: delegateUsersData } = useUsers({ limit: 100 });

  const teams = teamsData?.data || [];
  const venues = venuesData?.data || [];
  const competitions = competitionsData?.data || [];
  const referees = refereesData?.data || [];
  const delegateUsers = delegateUsersData?.data || [];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (editMatch) {
      const matchDate = editMatch.dateTime
        ? new Date(editMatch.dateTime)
        : null;
      setFormData({
        competitionId: editMatch.competitionId || "",
        homeTeamId: editMatch.homeTeamId || "",
        awayTeamId: editMatch.awayTeamId || "",
        venueId: editMatch.venueId || "",
        date: matchDate ? matchDate.toISOString().split("T")[0] : "",
        time: matchDate ? matchDate.toTimeString().substring(0, 5) : "",
        notes: editMatch.notes || "",
        mainRefereeId: editMatch.mainReferee?.id || "",
        assistantReferee1Id: editMatch.assistantReferee1?.id || "",
        assistantReferee2Id: editMatch.assistantReferee2?.id || "",
        delegateId: editMatch.delegate?.id || "",
      });
    } else {
      setFormData({
        competitionId: "",
        homeTeamId: "",
        awayTeamId: "",
        venueId: "",
        date: "",
        time: "",
        notes: "",
        mainRefereeId: "",
        assistantReferee1Id: "",
        assistantReferee2Id: "",
        delegateId: "",
      });
    }
    setErrors({});
  }, [editMatch, open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.competitionId)
      newErrors.competitionId = "Competition is required";
    if (!formData.homeTeamId) newErrors.homeTeamId = "Home team is required";
    if (!formData.awayTeamId) newErrors.awayTeamId = "Away team is required";
    if (!formData.venueId) newErrors.venueId = "Venue is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (formData.homeTeamId && formData.homeTeamId === formData.awayTeamId) {
      newErrors.awayTeamId = "Away team must be different from home team";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const dateTime = new Date(
        `${formData.date}T${formData.time}`
      ).toISOString();
      onSubmit({ ...formData, dateTime });
    }
  };

  if (!open) return null;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
      },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      py: 1.5,
      px: 2,
    },
    "& .MuiInputBase-input::placeholder": { color: "#6b7280", opacity: 1 },
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#121214",
          borderRadius: "16px",
          border: "1px solid #242428",
          width: "100%",
          maxWidth: 700,
          mx: 2,
          maxHeight: "90vh",
          overflow: "auto",
          animation: "slideIn 0.3s ease-out",
          "@keyframes slideIn": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "#121214",
            px: 3,
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            {editMatch ? "Edit Match" : "New Match"}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: "#6b7280", "&:hover": { bgcolor: "#242428" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Competition */}
          <Box>
            <Typography sx={labelStyles}>Competition *</Typography>
            <FormControl fullWidth sx={inputStyles}>
              <Select
                value={formData.competitionId}
                onChange={handleChange("competitionId")}
                displayEmpty
                error={!!errors.competitionId}
                sx={{
                  "& .MuiSelect-select": {
                    color: formData.competitionId ? "#fff" : "#6b7280",
                  },
                }}
              >
                <MenuItem value='' disabled>
                  Select competition
                </MenuItem>
                {competitions.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Teams */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>Home Team *</Typography>
              <FormControl fullWidth sx={inputStyles}>
                <Select
                  value={formData.homeTeamId}
                  onChange={handleChange("homeTeamId")}
                  displayEmpty
                  error={!!errors.homeTeamId}
                  sx={{
                    "& .MuiSelect-select": {
                      color: formData.homeTeamId ? "#fff" : "#6b7280",
                    },
                  }}
                >
                  <MenuItem value='' disabled>
                    Select home team
                  </MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography sx={labelStyles}>Away Team *</Typography>
              <FormControl fullWidth sx={inputStyles}>
                <Select
                  value={formData.awayTeamId}
                  onChange={handleChange("awayTeamId")}
                  displayEmpty
                  error={!!errors.awayTeamId}
                  sx={{
                    "& .MuiSelect-select": {
                      color: formData.awayTeamId ? "#fff" : "#6b7280",
                    },
                  }}
                >
                  <MenuItem value='' disabled>
                    Select away team
                  </MenuItem>
                  {teams
                    .filter((t) => t.id !== formData.homeTeamId)
                    .map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Venue and Date/Time */}
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}
          >
            <Box>
              <Typography sx={labelStyles}>Venue *</Typography>
              <FormControl fullWidth sx={inputStyles}>
                <Select
                  value={formData.venueId}
                  onChange={handleChange("venueId")}
                  displayEmpty
                  error={!!errors.venueId}
                  sx={{
                    "& .MuiSelect-select": {
                      color: formData.venueId ? "#fff" : "#6b7280",
                    },
                  }}
                >
                  <MenuItem value='' disabled>
                    Select venue
                  </MenuItem>
                  {venues.map((venue) => (
                    <MenuItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography sx={labelStyles}>Date *</Typography>
              <TextField
                fullWidth
                type='date'
                value={formData.date}
                onChange={handleChange("date")}
                error={!!errors.date}
                sx={{
                  ...inputStyles,
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)",
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Time *</Typography>
              <TextField
                fullWidth
                type='time'
                value={formData.time}
                onChange={handleChange("time")}
                error={!!errors.time}
                sx={{
                  ...inputStyles,
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Referee Assignment */}
          <Box
            sx={{
              p: 2,
              bgcolor: "rgba(26, 26, 29, 0.5)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              sx={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af" }}
            >
              Referee Assignment (Optional)
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Box>
                <Typography sx={labelStyles}>Main Referee</Typography>
                <FormControl fullWidth sx={inputStyles}>
                  <Select
                    value={formData.mainRefereeId}
                    onChange={handleChange("mainRefereeId")}
                    displayEmpty
                    sx={{
                      "& .MuiSelect-select": {
                        color: formData.mainRefereeId ? "#fff" : "#6b7280",
                      },
                    }}
                  >
                    <MenuItem value=''>Not assigned</MenuItem>
                    {referees.map((ref) => (
                      <MenuItem key={ref.id} value={ref.id}>
                        {ref.user?.firstName} {ref.user?.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={labelStyles}>Delegate</Typography>
                <FormControl fullWidth sx={inputStyles}>
                  <Select
                    value={formData.delegateId}
                    onChange={handleChange("delegateId")}
                    displayEmpty
                    sx={{
                      "& .MuiSelect-select": {
                        color: formData.delegateId ? "#fff" : "#6b7280",
                      },
                    }}
                  >
                    <MenuItem value=''>Not assigned</MenuItem>
                    {delegateUsers.map(
                      (del) =>
                        del?.role === "delegate" && (
                          <MenuItem key={del.id} value={del.id}>
                            {`${del?.firstName} ${del?.lastName}`}
                          </MenuItem>
                        )
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Box>
                <Typography sx={labelStyles}>Assistant Referee 1</Typography>
                <FormControl fullWidth sx={inputStyles}>
                  <Select
                    value={formData.assistantReferee1Id}
                    onChange={handleChange("assistantReferee1Id")}
                    displayEmpty
                    sx={{
                      "& .MuiSelect-select": {
                        color: formData.assistantReferee1Id
                          ? "#fff"
                          : "#6b7280",
                      },
                    }}
                  >
                    <MenuItem value=''>Not assigned</MenuItem>
                    {referees.map((ref) => (
                      <MenuItem key={ref.id} value={ref.id}>
                        {ref.user?.firstName} {ref.user?.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={labelStyles}>Assistant Referee 2</Typography>
                <FormControl fullWidth sx={inputStyles}>
                  <Select
                    value={formData.assistantReferee2Id}
                    onChange={handleChange("assistantReferee2Id")}
                    displayEmpty
                    sx={{
                      "& .MuiSelect-select": {
                        color: formData.assistantReferee2Id
                          ? "#fff"
                          : "#6b7280",
                      },
                    }}
                  >
                    <MenuItem value=''>Not assigned</MenuItem>
                    {referees.map((ref) => (
                      <MenuItem key={ref.id} value={ref.id}>
                        {ref.user?.firstName} {ref.user?.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* Notes */}
          <Box>
            <Typography sx={labelStyles}>Notes</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder='Additional notes about the match...'
              value={formData.notes}
              onChange={handleChange("notes")}
              sx={inputStyles}
            />
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "#121214",
            px: 3,
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
              "&:disabled": { bgcolor: "#3f3f46", color: "#6b7280" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : editMatch ? (
              "Update Match"
            ) : (
              "Create Match"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MatchModal;
