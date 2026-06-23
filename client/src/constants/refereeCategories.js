export const REFEREE_CATEGORY_VALUES = ["black", "green", "white", "none"];

export const REFEREE_CATEGORY_OPTIONS = [
  { value: "black", label: "Black" },
  { value: "green", label: "Green" },
  { value: "white", label: "White" },
  { value: "none", label: "No Category" },
];

export const REFEREE_CATEGORY_FILTERS = [
  { value: "all", label: "All categories" },
  ...REFEREE_CATEGORY_OPTIONS,
];

export const REFEREE_CATEGORY_META = {
  black: {
    label: "Black",
    color: "#f8fafc",
    bg: "rgba(13, 13, 14, 0.12)",
  },
  green: {
    label: "Green",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)",
  },
  white: {
    label: "White",
    color: "#e5e7eb",
    bg: "rgba(251, 252, 253, 0.53)",
  },
  none: {
    label: "No Category",
    color: "#9ca3af",
    bg: "rgba(107, 114, 128, 0.15)",
  },
};

export const getRefereeCategoryMeta = (category) =>
  REFEREE_CATEGORY_META[category] || REFEREE_CATEGORY_META.none;

export const getRefereeCategoryLabel = (category) =>
  getRefereeCategoryMeta(category).label;
