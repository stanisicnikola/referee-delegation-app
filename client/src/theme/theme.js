import { createTheme, alpha } from "@mui/material/styles";

// Login theme (orange accent)
const loginTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f97316",
      light: "#fb923c",
      dark: "#ea580c",
    },
    background: {
      default: "#0a0a0b",
      paper: "#121214",
    },
    grey: {
      900: "#0a0a0b",
      800: "#121214",
      700: "#1a1a1d",
      600: "#242428",
      500: "#2e2e33",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#9ca3af",
    },
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
        },
        containedPrimary: {
          background: "linear-gradient(to right, #f97316, #ea580c)",
          "&:hover": {
            background: "linear-gradient(to right, #fb923c, #f97316)",
            boxShadow: "0 10px 40px rgba(249, 115, 22, 0.4)",
            transform: "translateY(-2px)",
          },
          transition: "all 0.3s ease",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1a1a1d",
            borderRadius: 12,
            "& fieldset": {
              borderColor: "#242428",
            },
            "&:hover fieldset": {
              borderColor: "#f97316",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#f97316",
              boxShadow: "0 0 10px 6px rgba(249, 115, 22, 0.15)",
            },
          },
          "& .MuiInputBase-input": {
            color: "#fff",
            fontSize: "14px",
            padding: "14px 0px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9ca3af",
          "&.Mui-focused": {
            color: "#f97316",
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#f97316",
          "&:hover": {
            color: "#fb923c",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(18, 18, 20, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1px solid #242428",
        },
      },
    },
  },
});

const sharedPanelPalette = {
  secondary: {
    main: "#22d3ee",
    light: "#67e8f9",
    dark: "#06b6d4",
  },
  success: {
    main: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
  },
  background: {
    default: "#0a0a0b",
    paper: "#121214",
  },
  grey: {
    900: "#0a0a0b",
    800: "#121214",
    700: "#1a1a1d",
    600: "#242428",
    500: "#2e2e33",
    400: "#3f3f46",
    300: "#52525b",
    200: "#71717a",
    100: "#a1a1aa",
  },
  text: {
    primary: "#f3f4f6",
    secondary: "#9ca3af",
    disabled: "#6b7280",
  },
};

const sharedPanelTypography = {
  fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: "2.5rem",
  },
  h2: {
    fontWeight: 700,
    fontSize: "2rem",
  },
  h3: {
    fontWeight: 600,
    fontSize: "1.75rem",
  },
  h4: {
    fontWeight: 600,
    fontSize: "1.5rem",
  },
  h5: {
    fontWeight: 600,
    fontSize: "1.25rem",
  },
  h6: {
    fontWeight: 600,
    fontSize: "1rem",
  },
  button: {
    textTransform: "none",
    fontWeight: 600,
  },
  body1: {
    fontSize: "1rem",
  },
  body2: {
    fontSize: "0.875rem",
  },
};

const createPanelTheme = (primary) =>
  createTheme({
    palette: {
      mode: "dark",
      primary,
      ...sharedPanelPalette,
    },
    typography: sharedPanelTypography,
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "10px 20px",
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${primary.light} 0%, ${primary.main} 100%)`,
              boxShadow: `0 8px 25px ${alpha(primary.main, 0.35)}`,
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          },
          outlined: {
            borderColor: "#3f3f46",
            "&:hover": {
              borderColor: primary.main,
              backgroundColor: alpha(primary.main, 0.08),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#1a1a1d",
              borderRadius: 10,
              "& fieldset": {
                borderColor: "#3f3f46",
              },
              "&:hover fieldset": {
                borderColor: primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: primary.main,
                boxShadow: `0 0 0 3px ${alpha(primary.main, 0.15)}`,
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#9ca3af",
            "&.Mui-focused": {
              color: primary.main,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: "#1a1a1d",
            borderRadius: 10,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3f3f46",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: primary.main,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primary.main,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "#121214",
            borderRadius: 16,
            border: "1px solid #242428",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "1px solid #242428",
          },
          head: {
            backgroundColor: "#1a1a1d",
            fontWeight: 600,
            color: "#9ca3af",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: alpha(primary.main, 0.04),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "#121214",
            borderRight: "1px solid #242428",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: "2px 8px",
            "&.Mui-selected": {
              backgroundColor: alpha(primary.main, 0.15),
              "&:hover": {
                backgroundColor: alpha(primary.main, 0.2),
              },
            },
            "&:hover": {
              backgroundColor: alpha(primary.main, 0.08),
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "#121214",
            borderRadius: 16,
            border: "1px solid #242428",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: "#1a1a1d",
            border: "1px solid #242428",
            borderRadius: 12,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: alpha(primary.main, 0.08),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(primary.main, 0.15),
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: primary.main,
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: primary.main,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: alpha(primary.main, 0.08),
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            "& .MuiPaginationItem-root": {
              color: "#9ca3af",
              "&.Mui-selected": {
                backgroundColor: primary.main,
                color: "#fff",
                "&:hover": {
                  backgroundColor: primary.dark,
                },
              },
            },
          },
        },
      },
    },
  });

// Admin theme (purple accent)
const adminTheme = createPanelTheme({
  main: "#8b5cf6",
  light: "#a78bfa",
  dark: "#7c3aed",
});

// Delegate theme (orange accent)
const delegateTheme = createPanelTheme({
  main: "#f97316",
  light: "#fb923c",
  dark: "#ea580c",
});

// Referee theme (green accent)
const refereeTheme = createPanelTheme({
  main: "#22c55e",
  light: "#4ade80",
  dark: "#16a34a",
});

// Default export for backwards compatibility (login)
export default loginTheme;

// Named exports
export { loginTheme, adminTheme, delegateTheme, refereeTheme };
