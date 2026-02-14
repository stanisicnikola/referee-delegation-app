import { Button, CircularProgress } from "@mui/material";

/**
 * Reusable Button component that fits the project's design system.
 *
 * @param {string} variant - primary | secondary | danger | outline
 * @param {boolean} loading - Shows a spinner if true
 * @param {boolean} disabled - Disables the button
 * @param {ReactNode} children - Button text or content
 * @param {object} sx - MUI style overrides
 */
const CustomButton = ({
  variant = "primary",
  loading = false,
  disabled = false,
  children,
  sx = {},
  ...props
}) => {
  const getStyles = () => {
    const baseStyles = {
      px: 3,
      py: 1.25,
      borderRadius: "12px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: "14px",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: 1,
      minWidth: "100px",
    };

    switch (variant) {
      case "admin-primary":
        return {
          ...baseStyles,
          bgcolor: "#8b5cf6",
          color: "#fff",
          "&:hover": {
            bgcolor: "#7c3aed",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
          },
          "&.Mui-disabled": {
            bgcolor: "#8b5cf650",
            color: "#ffffff60",
          },
        };
      case "primary":
        return {
          ...baseStyles,
          bgcolor: "primary.main",
          color: "#fff",
          "&:hover": {
            bgcolor: "primary.main",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 24px rgba(249, 115, 22, 0.15)",
          },
          "&.Mui-disabled": {
            bgcolor: "#97431250",
            color: "#ffffff60",
          },
        };
      case "success":
        return {
          ...baseStyles,
          bgcolor: "#22c55e",
          color: "#fff",
          "&:hover": {
            bgcolor: "#16a34a",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
          },
        };

      case "danger":
        return {
          ...baseStyles,
          bgcolor: "#ef4444",
          color: "#fff",
          "&:hover": {
            bgcolor: "#dc2626",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
          },
        };
      case "outline":
        return {
          ...baseStyles,
          border: "1px solid #242428",
          color: "#fff",
          "&:hover": {
            bgcolor: "#1a1a1d",
            borderColor: "#3f3f46",
          },
        };
      case "success-outline":
        return {
          ...baseStyles,
          border: "1px solid #22c55e",
          color: "#22c55e",
          borderRadius: "8px",
          "&:hover": {
            bgcolor: "rgba(34, 197, 94, 0.05)",
            borderColor: "#16a34a",
            color: "#16a34a",
          },
        };
      case "danger-outline":
        return {
          ...baseStyles,
          border: "1px solid #ef4444",
          color: "#ef4444",
          borderRadius: "8px",
          "&:hover": {
            bgcolor: "rgba(239, 68, 68, 0.05)",
            borderColor: "#dc2626",
            color: "#dc2626",
          },
        };
      case "secondary":
      default:
        return {
          ...baseStyles,
          bgcolor: "#242428",
          color: "#fff",
          "&:hover": {
            bgcolor: "#3f3f46",
          },
        };
    }
  };

  return (
    <Button
      disabled={disabled || loading}
      sx={{ ...getStyles(), ...sx }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "inherit" }} />
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
