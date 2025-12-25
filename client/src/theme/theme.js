import { createTheme } from "@mui/material/styles";

const theme = createTheme({
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
              boxShadow: "0 0 0 4px rgba(249, 115, 22, 0.15)",
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

export default theme;
