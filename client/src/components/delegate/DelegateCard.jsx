import { Box, Typography, Button, Avatar } from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import UserStatusBadge from "../user/UserStatusBadge";

const DelegateCard = ({ delegate, onEdit, onDelete }) => {
  const initials = `${delegate?.firstName?.[0] || ""}${
    delegate?.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: 2.5,
        bgcolor: "rgb(18, 18, 20)",
        borderRadius: "16px",
        border: "1px solid #242428",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            borderRadius: "12px",
            bgcolor: "#8b5cf6",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {initials}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
            {delegate?.firstName} {delegate?.lastName}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
            {delegate?.role === "delegate" && "Delegate"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon sx={{ fontSize: 16, color: "#6b7280" }} />
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            {delegate?.email}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneIcon sx={{ fontSize: 16, color: "#6b7280" }} />
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            {delegate?.phone || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <UserStatusBadge status={delegate?.status} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mt: 8 }}>
        <Button
          fullWidth
          startIcon={<EditIcon />}
          onClick={() => onEdit?.(delegate)}
          sx={{
            bgcolor: "#1a1a1d",
            color: "#fff",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": { bgcolor: "#242428" },
          }}
        >
          Edit
        </Button>
        <Button
          fullWidth
          startIcon={<DeleteIcon />}
          onClick={() => onDelete?.(delegate)}
          sx={{
            bgcolor: "#1a1a1d",
            color: "#ef4444",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": { bgcolor: "#2a1f1f" },
          }}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default DelegateCard;
