import {
  formatPanelHeaderDate,
  parseLocalDateKey,
} from "../../../utils/dateFormatters";

export const AVAILABILITY_REQUEST_STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export const AVAILABILITY_REQUEST_STATUS_META = {
  pending: {
    label: "Pending approval",
    color: "#f59e0b",
  },
  approved: {
    label: "Approved",
    color: "#22c55e",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
};

export const getAvailabilityRequestStatusMeta = (status) =>
  AVAILABILITY_REQUEST_STATUS_META[status] ||
  AVAILABILITY_REQUEST_STATUS_META.pending;

export const getDateKey = (dateInput = new Date()) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.split("T")[0];
  return getDateKey(value);
};

const addDays = (dateKey, amount) => {
  const date = parseLocalDateKey(dateKey);

  if (!date) return null;

  date.setDate(date.getDate() + amount);
  return date;
};

const isNextDate = (previousDateKey, nextDateKey) =>
  getDateKey(addDays(previousDateKey, 1)) === nextDateKey;

export const formatAvailabilityRequestDate = (dateKey) => {
  const date = parseLocalDateKey(dateKey);
  return date ? formatPanelHeaderDate(date) : "-";
};

export const formatAvailabilityRequestDateRange = (startDate, endDate) => {
  if (startDate === endDate) return formatAvailabilityRequestDate(startDate);

  return `${formatAvailabilityRequestDate(
    startDate,
  )} - ${formatAvailabilityRequestDate(endDate)}`;
};

export const formatReviewedAt = (value) => {
  if (!value) return null;

  const formattedDate = formatPanelHeaderDate(value);
  return formattedDate === "-" ? null : formattedDate;
};

export const getRefereeName = (request) => {
  const user = request.referee?.user;

  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Referee"
  );
};

export const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const getReviewerName = (reviewer) =>
  reviewer
    ? [reviewer.firstName, reviewer.lastName].filter(Boolean).join(" ")
    : "";

export const groupAvailabilityRequests = (rows = []) => {
  const sortedRows = rows
    .map((row) => ({
      ...row,
      dateKey: normalizeDateKey(row.date),
      approvalStatus: row.approvalStatus || "pending",
      reason: row.reason || "Unavailable",
      description: row.description || "",
      refereeName: getRefereeName(row),
    }))
    .filter((row) => row.dateKey)
    .sort((a, b) => {
      const dateCompare = a.dateKey.localeCompare(b.dateKey);
      if (dateCompare !== 0) return dateCompare;
      return a.refereeName.localeCompare(b.refereeName);
    });

  return sortedRows.reduce((groups, row) => {
    const previous = groups[groups.length - 1];
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
      return groups;
    }

    groups.push({
      key: `${row.id}-${row.dateKey}`,
      refereeId: row.refereeId,
      referee: row.referee,
      refereeName: row.refereeName,
      reason: row.reason,
      description: row.description,
      approvalStatus: row.approvalStatus,
      reviewer: row.reviewer,
      reviewedAt: row.reviewedAt,
      startDate: row.dateKey,
      endDate: row.dateKey,
      ids: [row.id],
      items: [row],
    });

    return groups;
  }, []);
};
