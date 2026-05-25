export const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizeDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.split("T")[0];
  return getDateKey(new Date(value));
};

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

export const formatDisplayDate = (dateKey) =>
  parseDateKey(dateKey).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateRange = (startDate, endDate) =>
  startDate === endDate
    ? formatDisplayDate(startDate)
    : `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;

export const getMatchDateKey = (assignment) => {
  const match = assignment?.match || assignment?.Match;
  const scheduledAt = match?.scheduledAt || match?.matchDate || match?.date;

  if (!scheduledAt || !["pending", "accepted"].includes(assignment?.status)) {
    return null;
  }

  const date = new Date(scheduledAt);
  return Number.isNaN(date.getTime()) ? null : getDateKey(date);
};

const isNextDate = (previousDateKey, nextDateKey) =>
  getDateKey(addDays(parseDateKey(previousDateKey), 1)) === nextDateKey;

export const groupAvailabilityPeriods = (rows = []) => {
  const unavailableRows = rows
    .filter((row) => row && row.isAvailable === false)
    .map((row) => ({
      ...row,
      dateKey: normalizeDateKey(row.date),
      approvalStatus: row.approvalStatus || "approved",
      reason: row.reason || "Unavailable",
      description: row.description || "",
    }))
    .filter((row) => row.dateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  return unavailableRows.reduce((periods, row) => {
    const previous = periods[periods.length - 1];
    const canExtend =
      previous &&
      previous.refereeId === row.refereeId &&
      previous.reason === row.reason &&
      previous.description === row.description &&
      previous.approvalStatus === row.approvalStatus &&
      isNextDate(previous.endDate, row.dateKey);

    if (canExtend) {
      previous.endDate = row.dateKey;
      previous.ids.push(row.id);
      previous.items.push(row);
      return periods;
    }

    periods.push({
      key: `${row.id}-${row.dateKey}`,
      refereeId: row.refereeId,
      reason: row.reason,
      description: row.description,
      approvalStatus: row.approvalStatus,
      startDate: row.dateKey,
      endDate: row.dateKey,
      ids: [row.id],
      items: [row],
    });

    return periods;
  }, []);
};

export const buildAvailabilityCalendarGrid = ({
  year,
  month,
  todayKey,
  calendarByDate,
  matchDateSet,
}) => {
  const firstDay = new Date(year, month - 1, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const dateKey = getDateKey(date);
    const availability = calendarByDate.get(dateKey);
    const isCurrentMonth = date.getMonth() === month - 1;
    const hasMatch = matchDateSet.has(dateKey);
    const isApprovedUnavailable =
      availability?.isAvailable === false &&
      availability?.approvalStatus === "approved";

    const status = !isCurrentMonth
      ? "outside"
      : hasMatch
        ? "match"
        : isApprovedUnavailable
          ? "unavailable"
          : "available";

    return {
      dateKey,
      day: date.getDate(),
      isCurrentMonth,
      isToday: dateKey === todayKey,
      status,
      reason: availability?.reason,
    };
  });
};

export const countApprovedUnavailableDays = (calendar = []) =>
  calendar.filter(
    (item) => item.isAvailable === false && item.approvalStatus === "approved",
  ).length;

export const countMatchDaysInMonth = (matchDateSet, year, month) =>
  Array.from(matchDateSet).filter((dateKey) => {
    const date = parseDateKey(dateKey);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  }).length;
