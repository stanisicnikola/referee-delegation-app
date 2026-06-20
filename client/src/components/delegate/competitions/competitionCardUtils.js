import { formatDateTimeLabel } from "../../../utils/dateFormatters";

const COMPETITION_GRADIENTS = [
  "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
];

export const CATEGORY_LABELS = {
  seniors: "Seniors",
  juniors: "Juniors",
  youth: "Youth",
};

export const GENDER_LABELS = {
  male: "Men",
  female: "Women",
};

export const getCompetitionGradient = (index) =>
  COMPETITION_GRADIENTS[index % COMPETITION_GRADIENTS.length];

export const getCompetitionProgress = (competition) => {
  if (!competition.startDate || !competition.endDate) return 0;

  const now = new Date();
  const startDate = new Date(competition.startDate);
  const endDate = new Date(competition.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }
  if (now <= startDate) return 0;
  if (now >= endDate) return 100;

  const totalDuration = endDate.getTime() - startDate.getTime();
  if (totalDuration <= 0) return 0;

  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(
    100,
    Math.max(0, Math.round((elapsed / totalDuration) * 100)),
  );
};

export const getCompetitionDateRange = (competition) => {
  const startDate = formatDateTimeLabel(competition.startDate, {
    date: "",
    time: "",
  }).date;
  const endDate = formatDateTimeLabel(competition.endDate, {
    date: "",
    time: "",
  }).date;

  return startDate && endDate
    ? `${startDate} - ${endDate}`
    : "Period not defined";
};
