import {
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
  WEEKDAY_SHORT_NAMES,
} from "../constants/date";

export const DEFAULT_MATCH_DATE_TILE = {
  weekday: "-",
  day: "--",
  month: "---",
  time: "--:--",
};

export const DEFAULT_SHORT_DATE_LABEL = {
  weekday: "-",
  label: "--",
};

export const DEFAULT_MATCH_SUMMARY_DATE = {
  shortDay: "-",
  fullDate: "TBA",
  time: "--:--",
};

export const parseLocalDateKey = (dateString) => {
  const [year, month, day] = String(dateString).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

export const formatMatchDateTile = (dateString) => {
  const date = new Date(dateString);

  if (!dateString || Number.isNaN(date.getTime())) {
    return DEFAULT_MATCH_DATE_TILE;
  }

  return {
    weekday: WEEKDAY_SHORT_NAMES[date.getDay()],
    day: date.getDate(),
    month: MONTH_SHORT_NAMES[date.getMonth()],
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export const formatShortDateLabel = (dateString) => {
  if (!dateString) return DEFAULT_SHORT_DATE_LABEL;

  const date = parseLocalDateKey(dateString) || new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return DEFAULT_SHORT_DATE_LABEL;
  }

  return {
    weekday: WEEKDAY_SHORT_NAMES[date.getDay()],
    label: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  };
};

export const formatDateTimeLabel = (
  dateTime,
  fallback = { date: "-", time: "-" },
) => {
  if (!dateTime) return fallback;

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) return fallback;

  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export const formatPanelHeaderDate = (dateInput = new Date()) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) return "-";

  return `${String(date.getDate()).padStart(2, "0")}. ${
    MONTH_SHORT_NAMES[date.getMonth()]
  } ${date.getFullYear()}`;
};

export const formatMatchSummaryDate = (dateString) => {
  const date = new Date(dateString);

  if (!dateString || Number.isNaN(date.getTime())) {
    return DEFAULT_MATCH_SUMMARY_DATE;
  }

  return {
    shortDay: WEEKDAY_SHORT_NAMES[date.getDay()].toUpperCase(),
    fullDate: `${String(date.getDate()).padStart(2, "0")} ${
      MONTH_NAMES[date.getMonth()]
    } ${date.getFullYear()}`,
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
