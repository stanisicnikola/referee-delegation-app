const REFEREE_CATEGORY_VALUES = ["black", "green", "white", "none"];

const REFEREE_CATEGORY_LABELS = {
  black: "Black",
  green: "Green",
  white: "White",
  none: "No Category",
};

const getRefereeCategoryLabel = (category) =>
  REFEREE_CATEGORY_LABELS[category] || REFEREE_CATEGORY_LABELS.none;

module.exports = {
  REFEREE_CATEGORY_VALUES,
  REFEREE_CATEGORY_LABELS,
  getRefereeCategoryLabel,
};
