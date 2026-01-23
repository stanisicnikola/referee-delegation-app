import { Box, Typography } from "@mui/material";
import {
  Person as PersonIcon,
  Groups as GroupsIcon,
  VerifiedUser as AdminIcon,
} from "@mui/icons-material";

const RoleSelection = ({
  watchedRole,
  allowedRoles,
  onChange,
  editUser = null,
}) => {
  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };
  return (
    <Box>
      <Typography sx={labelStyles}>User Type *</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.5,
        }}
      >
        {[
          {
            value: "referee",
            label: "Referee",
            icon: PersonIcon,
            color: "#22c55e",
          },
          {
            value: "delegate",
            label: "Delegate",
            icon: GroupsIcon,
            color: "#3b82f6",
          },
          {
            value: "admin",
            label: "Admin",
            icon: AdminIcon,
            color: "#8b5cf6",
          },
        ].map((role) => {
          const isSelected = watchedRole === role.value;
          const isDisabled =
            (editUser && !isSelected) ||
            (allowedRoles && !allowedRoles.includes(role.value));

          return (
            <Box
              key={role.value}
              onClick={() => {
                !isDisabled && onChange?.(role.value);
              }}
              sx={{
                p: 2,
                bgcolor: "#1a1a1d",
                border: "2px solid",
                borderColor: isSelected ? "#8b5cf6" : "#242428",
                borderRadius: "12px",
                textAlign: "center",
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isDisabled ? 0.4 : 1,
                "&:hover": {
                  borderColor: isDisabled
                    ? "#242428"
                    : isSelected
                    ? "#8b5cf6"
                    : "#3f3f46",
                },
                ...(isSelected && {
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                }),
              }}
            >
              <role.icon
                sx={{
                  fontSize: 32,
                  color: isDisabled ? "#4b5563" : role.color,
                  mb: 1,
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isDisabled ? "#4b5563" : "#fff",
                }}
              >
                {role.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RoleSelection;
