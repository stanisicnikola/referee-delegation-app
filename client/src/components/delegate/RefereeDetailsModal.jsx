import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const RefereeDetailsModal = ({ open, referee, onClose, avatarColor, availabilityStyle }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#0f0f12",
          border: "1px solid #242428",
          borderRadius: "16px",
          color: "#fff",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 3,
          borderBottom: "1px solid #242428",
          background:
            "linear-gradient(180deg, rgba(249,115,22,0.06) 0%, transparent 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: avatarColor,
              fontSize: "22px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {referee?.user?.firstName?.[0]}
            {referee?.user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
              {referee?.user?.firstName} {referee?.user?.lastName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
              {referee?.licenseCategory && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: "14px !important" }} />}
                  label={`Category ${referee.licenseCategory}`}
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
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: "6px",
                  bgcolor: availabilityStyle.bg,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: availabilityStyle.dot,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: availabilityStyle.color,
                  }}
                >
                  {availabilityStyle.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        {(() => {
          const contactFields = [
            { label: "Email", value: referee?.user?.email },
            {
              label: "Phone",
              value: referee?.phone || referee?.user?.phone,
            },
            { label: "City", value: referee?.city },
            { label: "Address", value: referee?.address },
          ].filter((f) => f.value);

          const professionalFields = [
            { label: "License Number", value: referee?.licenseNumber },
            {
              label: "Experience",
              value:
                referee?.experienceYears != null
                  ? `${referee.experienceYears} years`
                  : null,
            },
          ].filter((f) => f.value);

          const additionalFields = [
            {
              label: "Date of Birth",
              value: formatDate(referee?.dateOfBirth),
            },
            { label: "User Status", value: referee?.user?.status },
            { label: "Notes", value: referee?.notes, fullWidth: true },
            { label: "Created", value: formatDate(referee?.createdAt) },
            { label: "Last Updated", value: formatDate(referee?.updatedAt) },
          ].filter((f) => f.value);

          const sections = [
            { title: "Contact", fields: contactFields },
            { title: "License & Professional", fields: professionalFields },
            { title: "Additional Info", fields: additionalFields },
          ].filter((s) => s.fields.length > 0);

          if (sections.length === 0) {
            return (
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: "14px",
                  textAlign: "center",
                  py: 3,
                }}
              >
                No additional referee details available.
              </Typography>
            );
          }

          return sections.map((section, si) => (
            <Box
              key={section.title}
              sx={{ mb: si < sections.length - 1 ? 3 : 0 }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#f97316",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  mb: 1.5,
                }}
              >
                {section.title}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {section.fields.map((field) => (
                  <Box
                    key={field.label}
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      bgcolor: "#121214",
                      border: "1px solid #242428",
                      ...(field.fullWidth
                        ? { gridColumn: { sm: "span 2" } }
                        : {}),
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "11px", color: "#6b7280", mb: 0.5 }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#fff",
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                        whiteSpace: field.fullWidth ? "pre-wrap" : "normal",
                      }}
                    >
                      {field.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ));
        })()}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #242428",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#f97316",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(249, 115, 22, 0.08)" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefereeDetailsModal;
