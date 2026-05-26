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

export const getDateKeysInRange = (dateFrom, dateTo = dateFrom) => {
  if (!dateFrom || !dateTo || dateFrom > dateTo) return [];

  const dates = [];
  let currentDate = parseDateKey(dateFrom);
  const endDate = parseDateKey(dateTo);

  while (currentDate <= endDate) {
    dates.push(getDateKey(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
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

export const getMatchDateKey = (
  assignment,
  allowedStatuses = ["pending", "accepted"],
) => {
  const match = assignment?.match || assignment?.Match;
  const scheduledAt = match?.scheduledAt || match?.matchDate || match?.date;

  if (!scheduledAt || !allowedStatuses.includes(assignment?.status)) {
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
    .map((row) => normalizeAvailabilityRow(row))
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

export const normalizeAvailabilityRow = (row) => ({
  ...row,
  dateKey: normalizeDateKey(row.date),
  approvalStatus: row.approvalStatus || "approved",
  reason: row.reason || "Unavailable",
  description: row.description || "",
  reviewedAt: row.reviewedAt || null,
});

export const isRecentlyRejectedAvailability = (row, todayKey) => {
  if (!row.reviewedAt) return true;

  const reviewedDate = new Date(row.reviewedAt);
  if (Number.isNaN(reviewedDate.getTime())) return true;

  const hideAfterDate = addDays(reviewedDate, 2);
  return todayKey <= getDateKey(hideAfterDate);
};

export const shouldShowAvailabilityRow = (row, todayKey) => {
  const normalizedRow = normalizeAvailabilityRow(row);

  if (normalizedRow.approvalStatus === "approved") {
    return normalizedRow.dateKey > todayKey;
  }

  if (normalizedRow.approvalStatus === "rejected") {
    return isRecentlyRejectedAvailability(normalizedRow, todayKey);
  }

  return true;
};

export const filterVisibleAvailabilityRows = (rows = [], todayKey) =>
  rows.filter((row) => shouldShowAvailabilityRow(row, todayKey));

export const shouldShowAvailabilityPeriod = (period, todayKey) => {
  if (period.approvalStatus === "approved") {
    return period.startDate > todayKey;
  }

  if (period.approvalStatus === "rejected") {
    return period.items.some((item) =>
      isRecentlyRejectedAvailability(item, todayKey),
    );
  }

  return true;
};

export const filterVisibleAvailabilityPeriods = (periods = [], todayKey) =>
  periods.filter((period) => shouldShowAvailabilityPeriod(period, todayKey));

export const getDateRangeConflicts = (dateFrom, dateTo, blockedDateSet) =>
  getDateKeysInRange(dateFrom, dateTo).filter((dateKey) =>
    blockedDateSet.has(dateKey),
  );

export const formatDateConflictMessage = (conflictDateKeys) => {
  const dates = conflictDateKeys.slice(0, 3).map(formatDisplayDate);
  const remainingCount = conflictDateKeys.length - dates.length;
  const suffix = remainingCount > 0 ? ` and ${remainingCount} more` : "";

  return `You already accepted a match on ${dates.join(", ")}${suffix}. Choose dates without accepted matches.`;
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
