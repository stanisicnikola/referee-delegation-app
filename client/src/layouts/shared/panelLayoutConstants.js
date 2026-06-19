export const PANEL_SIDEBAR_WIDTH = 256;
export const PANEL_HEADER_HEIGHT = 97;
export const PANEL_BORDER = "1px solid #242428";

export const PANEL_APP_BAR_SX = {
  height: { xs: 56, md: PANEL_HEADER_HEIGHT },
  minHeight: { xs: 56, md: PANEL_HEADER_HEIGHT },
  boxSizing: "border-box",
  bgcolor: "#0a0a0b",
  borderBottom: PANEL_BORDER,
  flexShrink: 0,
};

export const PANEL_TOOLBAR_SX = {
  height: "100%",
  minHeight: "100%",
  px: { xs: 2, md: 4 },
  justifyContent: "space-between",
};

export const PANEL_DRAWER_PAPER_SX = {
  boxSizing: "border-box",
  width: PANEL_SIDEBAR_WIDTH,
  bgcolor: "#121214",
  border: "none",
  borderRight: PANEL_BORDER,
  display: "flex",
  flexDirection: "column",
};
