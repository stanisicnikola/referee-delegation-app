import { Box, Button, CircularProgress, Tooltip } from "@mui/material";
import { InfoOutlined as InfoIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

/**
 * Reusable Button component that fits the project's design system.
 *
 * @param {string} variant - admin-primary | delegate-primary | referee-primary | referee-accept | referee-decline | admin-outline | delegate-outline | referee-outline | primary | secondary | danger | outline
 * @param {boolean} loading - Shows a spinner if true
 * @param {boolean} disabled - Disables the button
 * @param {string} infoTooltip - Optional helper text shown on hover/focus
 * @param {ReactNode} children - Button text or content
 * @param {object} sx - MUI style overrides
 */
const CustomButton = ({
  variant = "admin-primary",
  loading = false,
  disabled = false,
  infoTooltip = "",
  tooltipWrapperSx = {},
  children,
  sx = {},
  startIcon,
  endIcon,
  ...props
}) => {
  const theme = useTheme();

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
      case "delegate-primary":
        return {
          ...baseStyles,
          bgcolor: "#f97316",
          color: "#fff",
          "&:hover": {
            bgcolor: "#ea580c",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
          },
          "&.Mui-disabled": {
            bgcolor: "#f9731650",
            color: "#ffffff60",
          },
        };
      case "referee-primary":
        return {
          ...baseStyles,
          bgcolor: "#22c55e",
          color: "#fff",
          "&:hover": {
            bgcolor: "#16a34a",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
          },
          "&.Mui-disabled": {
            bgcolor: "#22c55e50",
            color: "#ffffff60",
          },
        };
      case "referee-accept": {
        const main = theme.palette.success.main;
        const light = theme.palette.success.light;

        return {
          ...baseStyles,
          bgcolor: alpha(main, 0.14),
          color: light,
          border: `1px solid ${alpha(main, 0.36)}`,
          boxShadow: "none",
          "&:hover": {
            bgcolor: alpha(light, 0.18),
            borderColor: alpha(light, 0.62),
            transform: "translateY(-1px)",
            boxShadow: `0 4px 14px ${alpha(main, 0.16)}`,
          },
          "&.Mui-disabled": {
            bgcolor: "rgba(255, 255, 255, 0.08)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            color: theme.palette.text.disabled,
          },
        };
      }
      case "referee-decline": {
        const main = theme.palette.error.main;
        const dark = theme.palette.error.dark;

        return {
          ...baseStyles,
          bgcolor: alpha(main, 0.16),
          color: theme.palette.error.light,
          border: `1px solid ${alpha(main, 0.34)}`,
          boxShadow: "none",
          "&:hover": {
            bgcolor: alpha(main, 0.24),
            borderColor: alpha(dark, 0.65),
            transform: "translateY(-1px)",
            boxShadow: `0 4px 14px ${alpha(main, 0.16)}`,
          },
          "&.Mui-disabled": {
            bgcolor: "rgba(255, 255, 255, 0.08)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            color: theme.palette.text.disabled,
          },
        };
      }
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
          "&.Mui-disabled": {
            bgcolor: "#ef444450",
            color: "#ffffff60",
          },
        };
      case "admin-outline":
        return {
          ...baseStyles,
          border: "1px solid",
          borderColor: "rgba(139, 92, 246, 0.5)",
          color: "#a78bfa",
          "&:hover": {
            bgcolor: "rgba(139, 92, 246, 0.05)",
            transform: "translateY(-1px)",
            borderColor: "#8b5cf6",
          },
        };
      case "delegate-outline":
        return {
          ...baseStyles,
          border: "1px solid",
          borderColor: "rgb(244, 105, 6)",
          color: "#ee681a",
          "&:hover": {
            bgcolor: "rgba(244, 148, 79, 0.09)",
            transform: "translateY(-1px)",
            borderColor: "#f66905",
          },
        };
      case "referee-outline":
        return {
          ...baseStyles,
          border: "1px solid",
          borderColor: "rgba(34, 197, 94, 0.55)",
          color: "#22c55e",
          "&:hover": {
            bgcolor: "rgba(34, 197, 94, 0.06)",
            transform: "translateY(-1px)",
            borderColor: "#16a34a",
          },
        };
      case "outline":
        return {
          ...baseStyles,
          border: "1px solid #242428",
          color: "#fff",
          "&:hover": {
            bgcolor: "#1a1a1d",
            transform: "translateY(-1px)",
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
            transform: "translateY(-1px)",
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
            transform: "translateY(-1px)",
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
            transform: "translateY(-1px)",
          },
        };
    }
  };

  const button = (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{ ...getStyles(), ...sx }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "inherit" }} />
      ) : (
        <>
          {children}
          {infoTooltip && (
            <InfoIcon
              aria-label={infoTooltip}
              sx={{
                fontSize: 16,
                opacity: disabled ? 0.8 : 0.95,
                flexShrink: 0,
              }}
            />
          )}
        </>
      )}
    </Button>
  );

  if (!infoTooltip) return button;

  return (
    <Tooltip title={infoTooltip} arrow disableInteractive>
      <Box component='span' sx={{ display: "inline-flex", ...tooltipWrapperSx }}>
        {button}
      </Box>
    </Tooltip>
  );
};

export default CustomButton;
