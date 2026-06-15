import {
  Avatar,
  Box,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  Person as PersonIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { SLOT_CONFIG } from "./constants";

const CandidateRow = ({ referee, assignedReferees, onAssign, disabled }) => {
  const declinedAssignment = referee.declinedAssignment;
  const hasDeclined = Boolean(declinedAssignment);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: hasDeclined ? "rgba(239,68,68,0.28)" : "#1e1e22",
        borderRadius: "10px",
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        transition: "all 0.15s ease",
        bgcolor: hasDeclined ? "rgba(239,68,68,0.05)" : "transparent",
        "&:hover": {
          borderColor: hasDeclined ? "rgba(239,68,68,0.4)" : "#2e2e33",
          bgcolor: hasDeclined
            ? "rgba(239,68,68,0.07)"
            : "rgba(255,255,255,0.02)",
        },
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {referee.user?.firstName?.[0]}
        {referee.user?.lastName?.[0]}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography
            sx={{
              color: "#e5e7eb",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {referee.user?.firstName} {referee.user?.lastName}
          </Typography>
          {hasDeclined && (
            <Box
              sx={{
                color: "#f87171",
                bgcolor: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "5px",
                px: 0.75,
                py: "1px",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Declined
            </Box>
          )}
        </Box>
        <Typography sx={{ color: "#6b7280", fontSize: 11 }}>
          Cat. {referee.licenseCategory || "-"} - {referee.city || "-"}
        </Typography>
        {hasDeclined && (
          <Typography sx={{ color: "#fca5a5", fontSize: 11, mt: 0.35 }}>
            {declinedAssignment.roleLabel} - {declinedAssignment.reasonLabel}
            {declinedAssignment.notes ? ` - ${declinedAssignment.notes}` : ""}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "grid", sm: "flex" },
          gridTemplateColumns: { xs: "repeat(3, minmax(0, 1fr))" },
          gap: 0.5,
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {SLOT_CONFIG.map((slotConfig) => {
          const occupied = Boolean(assignedReferees[slotConfig.slot]);
          const isDisabled = disabled || occupied || hasDeclined;

          return (
            <Box
              key={slotConfig.slot}
              onClick={
                isDisabled
                  ? undefined
                  : () => onAssign(referee, slotConfig.slot)
              }
              title={
                hasDeclined
                  ? `Declined this match: ${declinedAssignment.reasonLabel}`
                  : disabled
                    ? "Assignments are locked for this match"
                    : occupied
                      ? `${slotConfig.label} slot is taken`
                      : `Assign as ${slotConfig.label}`
              }
              sx={{
                px: 1.25,
                py: "5px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 600,
                lineHeight: 1.4,
                cursor: isDisabled ? "not-allowed" : "pointer",
                border: "1px solid",
                borderColor: isDisabled ? "#1e1e22" : `${slotConfig.accent}44`,
                color: isDisabled ? "#2a2a2e" : slotConfig.accent,
                bgcolor: isDisabled ? "transparent" : `${slotConfig.accent}10`,
                userSelect: "none",
                transition: "all 0.15s",
                textAlign: "center",
                ...(!isDisabled && {
                  "&:hover": {
                    bgcolor: `${slotConfig.accent}22`,
                    borderColor: `${slotConfig.accent}77`,
                  },
                }),
              }}
            >
              {isDisabled ? "-" : slotConfig.buttonLabel}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const AvailableRefereesPanel = ({
  search,
  onSearchChange,
  availableReferees,
  assignedReferees,
  assignableCount,
  declinedCount,
  isAssignmentLocked,
  saveDisabledReason,
  emptyCandidatesMessage,
  onAssign,
}) => (
  <Box
    sx={{
      bgcolor: "#121214",
      borderRadius: "16px",
      border: "1px solid #242428",
      overflow: "hidden",
      minHeight: 400,
    }}
  >
    <Box sx={{ p: 2, borderBottom: "1px solid #242428" }}>
      <TextField
        placeholder='Search referees...'
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
        size='small'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#1a1a1d",
            borderRadius: "10px",
            "& fieldset": { borderColor: "#242428" },
            "&:hover fieldset": { borderColor: "#3f3f46" },
            "&.Mui-focused fieldset": { borderColor: "#f97316" },
          },
          "& .MuiInputBase-input": {
            color: "#fff",
            fontSize: "14px",
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1.25,
        }}
      >
        <Typography
          sx={{
            color: "#6b7280",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Available - {assignableCount}
          {declinedCount > 0 ? ` - Declined ${declinedCount}` : ""}
        </Typography>
        {search.trim() !== "" && (
          <Typography sx={{ color: "#4b5563", fontSize: 11 }}>
            {availableReferees.length} result
            {availableReferees.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>
    </Box>

    <Box
      sx={{
        p: 1.5,
        maxHeight: 560,
        overflowY: "auto",
        display: "grid",
        gap: 1,
      }}
    >
      {availableReferees.map((referee) => (
        <CandidateRow
          key={referee.id}
          referee={referee}
          assignedReferees={assignedReferees}
          onAssign={onAssign}
          disabled={isAssignmentLocked}
        />
      ))}

      {availableReferees.length === 0 && (
        <Box
          sx={{
            py: 5,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: "rgba(107,114,128,0.07)",
              border: "1px solid rgba(107,114,128,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonIcon sx={{ fontSize: 22, color: "#6b7280" }} />
          </Box>
          <Typography sx={{ fontSize: 13, color: "#6b7280", maxWidth: 210 }}>
            {isAssignmentLocked
              ? saveDisabledReason || "Assignments are locked for this match."
              : emptyCandidatesMessage}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

export default AvailableRefereesPanel;
