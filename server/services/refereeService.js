const { Op } = require("sequelize");
const {
  Referee,
  User,
  MatchReferee,
  RefereeAvailability,
  Match,
  Competition,
  Team,
  Venue,
  sequelize,
} = require("../models");
const { AppError } = require("../middlewares");

const ACTIVE_ASSIGNMENT_STATUSES = ["pending", "accepted"];
const BLOCKING_AVAILABILITY_STATUSES = ["approved"];

class RefereeService {
  toLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getLocalDayRange(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  getMonthRange(value = new Date()) {
    const sourceDate =
      typeof value === "string" && /^\d{4}-\d{2}$/.test(value)
        ? new Date(`${value}-01T00:00:00`)
        : new Date(value);
    const date = Number.isNaN(sourceDate.getTime()) ? new Date() : sourceDate;
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    return { start, end };
  }

  formatMonthKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  }

  formatDashboardDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return { weekday: "-", day: "--", month: "---", time: "--:--" };
    }

    return {
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: String(date.getDate()).padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  }

  getDashboardCalendar(monthStart, matchDateKeys) {
    const firstDay = new Date(monthStart);
    const lastDay = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
    );
    const startOffset = (firstDay.getDay() + 6) % 7;
    const todayKey = this.toLocalDateKey(new Date());
    const days = [];

    for (let index = 0; index < startOffset; index += 1) {
      days.push({ day: null, type: "empty" });
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );
      const dateKey = this.toLocalDateKey(date);
      const hasMatch = matchDateKeys.has(dateKey);

      days.push({
        day,
        dateKey,
        type: hasMatch ? "match" : "normal",
        isToday: dateKey === todayKey,
      });
    }

    return {
      month: this.formatMonthKey(monthStart),
      monthLabel: monthStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      days,
    };
  }

  async findAll(query = {}) {
    const { page = 1, limit = 10, licenseCategory, city, search } = query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    const userWhere = {};

    if (licenseCategory) where.licenseCategory = licenseCategory;
    if (city) where.city = { [Op.like]: `%${city}%` };

    if (search) {
      userWhere[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Referee.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          where: search ? userWhere : undefined,
        },
      ],
      limit: limitNum,
      offset,
      order: [[{ model: User, as: "user" }, "lastName", "ASC"]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  async findById(id) {
    const referee = await Referee.findByPk(id, {
      include: [{ model: User, as: "user" }],
    });

    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    return referee;
  }

  async findByUserId(userId) {
    const referee = await Referee.findOne({
      where: { userId },
      include: [{ model: User, as: "user" }],
    });

    return referee;
  }

  async create(refereeData) {
    const existingLicense = await Referee.findOne({
      where: { licenseNumber: refereeData.licenseNumber },
    });

    if (existingLicense) {
      throw new AppError(
        "Referee with this license number already exists.",
        400,
      );
    }

    const referee = await Referee.create(refereeData);

    return this.findById(referee.id);
  }

  async update(id, refereeData) {
    const referee = await Referee.findByPk(id);

    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    if (
      refereeData.licenseNumber &&
      refereeData.licenseNumber !== referee.licenseNumber
    ) {
      const existingLicense = await Referee.findOne({
        where: { licenseNumber: refereeData.licenseNumber },
      });
      if (existingLicense) {
        throw new AppError(
          "Referee with this license number already exists.",
          400,
        );
      }
    }

    await referee.update(refereeData);

    return this.findById(id);
  }

  async delete(id) {
    const referee = await Referee.findByPk(id);

    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    await referee.destroy();

    return { message: "Referee deleted successfully." };
  }

  async getAssignments(refereeId, query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      competitionId,
      role,
      period,
      view,
    } = query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const where = { refereeId };
    const matchWhere = { status: { [Op.ne]: "cancelled" } };

    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES };
    }
    if (role && role !== "all") where.role = role;
    if (competitionId && competitionId !== "all") {
      matchWhere.competitionId = competitionId;
    }

    if (period === "upcoming") {
      matchWhere.scheduledAt = { [Op.gte]: new Date() };
    }

    if (period === "past") {
      matchWhere.scheduledAt = { [Op.lt]: new Date() };
    }

    if (dateFrom) matchWhere.scheduledAt = { [Op.gte]: new Date(dateFrom) };
    if (dateTo) {
      matchWhere.scheduledAt = {
        ...matchWhere.scheduledAt,
        [Op.lte]: new Date(dateTo),
      };
    }

    const isScheduleView = view === "schedule";
    const orderDirection = isScheduleView && period !== "past" ? "ASC" : "DESC";

    const { count, rows } = await MatchReferee.findAndCountAll({
      where,
      include: [
        {
          model: Match,
          as: "match",
          where: Object.keys(matchWhere).length > 0 ? matchWhere : undefined,
          include: [
            { model: Competition, as: "competition" },
            { model: Team, as: "homeTeam" },
            { model: Team, as: "awayTeam" },
            { model: Venue, as: "venue" },
            {
              model: User,
              as: "delegate",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      limit: limitNum,
      offset,
      order: [[{ model: Match, as: "match" }, "scheduledAt", orderDirection]],
    });

    const matchIds = [
      ...new Set(rows.map((assignment) => assignment.matchId).filter(Boolean)),
    ];

    if (matchIds.length > 0) {
      const activeAssignments = await MatchReferee.findAll({
        where: {
          matchId: { [Op.in]: matchIds },
          status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES },
        },
        include: [
          {
            model: Referee,
            as: "referee",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName", "avatarUrl"],
              },
            ],
          },
        ],
        order: [["role", "ASC"]],
      });

      const assignmentsByMatchId = activeAssignments.reduce(
        (acc, assignment) => {
          if (!acc[assignment.matchId]) acc[assignment.matchId] = [];
          acc[assignment.matchId].push(assignment);
          return acc;
        },
        {},
      );

      rows.forEach((assignment) => {
        assignment.match?.setDataValue(
          "refereeAssignments",
          assignmentsByMatchId[assignment.matchId] || [],
        );
      });
    }

    const data = isScheduleView
      ? rows.map((assignment, index) =>
          this.toScheduleAssignmentRow(assignment, offset + index),
        )
      : rows;

    return {
      data,
      ...(isScheduleView
        ? { groups: this.groupScheduleAssignments(data, period) }
        : {}),
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  formatScheduleAssignmentDate(dateValue) {
    if (!dateValue) {
      return {
        day: "--",
        month: "---",
        weekday: "---",
        time: "--:--",
        full: "Date not set",
        displayDate: "-- --- ----",
        monthGroup: "Date not set",
        sortKey: "9999-99",
      };
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return {
        day: "--",
        month: "---",
        weekday: "---",
        time: "--:--",
        full: "Date not set",
        displayDate: "-- --- ----",
        monthGroup: "Date not set",
        sortKey: "9999-99",
      };
    }

    const monthNumber = String(date.getMonth() + 1).padStart(2, "0");

    return {
      day: String(date.getDate()).padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      full: date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      displayDate: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      monthGroup: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      sortKey: `${date.getFullYear()}-${monthNumber}`,
    };
  }

  toScheduleAssignmentRow(assignment, index) {
    const match = assignment.match;
    const homeTeam = match?.homeTeam?.name || "Home team";
    const awayTeam = match?.awayTeam?.name || "Away team";
    const venue = match?.venue;
    const competitionLabel = match?.competition?.name || "Competition";
    const roundLabel = match?.round ? `Round ${match.round}` : null;
    const matchNumberLabel = match?.matchNumber
      ? `Match ${match.matchNumber}`
      : null;
    const dateInfo = this.formatScheduleAssignmentDate(match?.scheduledAt);
    const currentRefereeId = assignment.refereeId || assignment.referee_id;
    const acceptedColleagues =
      assignment.status === "accepted"
        ? (match?.refereeAssignments || [])
            .filter((matchAssignment) => {
              const refereeId =
                matchAssignment.refereeId || matchAssignment.referee_id;

              return (
                refereeId &&
                refereeId !== currentRefereeId &&
                matchAssignment.status === "accepted"
              );
            })
            .map((matchAssignment, refereeIndex) => {
              const name = this.getUserDisplayName(
                matchAssignment.referee?.user,
                "Colleague",
              );

              return {
                id:
                  matchAssignment.refereeId ||
                  matchAssignment.id ||
                  `colleague-${refereeIndex}`,
                name,
                initials: this.getInitials(name),
              };
            })
        : [];

    return {
      id:
        assignment.id || assignment.matchId || match?.id || `schedule-${index}`,
      matchId: assignment.matchId,
      status: assignment.status,
      role: assignment.role,
      roleNumber: this.getRefereeRoleNumber(assignment.role),
      dateInfo,
      homeTeamLabel: homeTeam,
      awayTeamLabel: awayTeam,
      matchLabel: `${homeTeam} vs ${awayTeam}`,
      competitionLabel,
      roundLabel,
      matchNumberLabel,
      detailChips: [competitionLabel, roundLabel, matchNumberLabel]
        .filter(Boolean)
        .map((label, chipIndex) => ({
          label,
          tone: chipIndex === 0 ? "competition" : "neutral",
        })),
      venueLabel: venue
        ? [venue.name, venue.city].filter(Boolean).join(", ")
        : "Venue not set",
      acceptedColleagues,
    };
  }

  groupScheduleAssignments(assignments, period) {
    const groups = new Map();

    assignments.forEach((assignment) => {
      const key = assignment.dateInfo?.sortKey || "9999-99";

      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          name: assignment.dateInfo?.monthGroup || "Date not set",
          matches: [],
        });
      }

      groups.get(key).matches.push(assignment);
    });

    return [...groups.values()].sort((first, second) =>
      period === "past"
        ? second.id.localeCompare(first.id)
        : first.id.localeCompare(second.id),
    );
  }

  getRefereeRoleNumber(role) {
    const numbers = {
      first_referee: "1",
      second_referee: "2",
      third_referee: "3",
    };

    return numbers[role] || "R";
  }

  getUserDisplayName(user, fallback = "Colleague") {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    return name || fallback;
  }

  getInitials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "?";

    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  formatPendingAssignmentDate(dateValue) {
    if (!dateValue) {
      return {
        day: "--",
        month: "---",
        weekday: "---",
        time: "--:--",
        full: "Date not set",
        displayDate: "-- --- ----",
      };
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return {
        day: "--",
        month: "---",
        weekday: "---",
        time: "--:--",
        full: "Date not set",
        displayDate: "-- --- ----",
      };
    }

    return {
      day: String(date.getDate()).padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      full: date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      displayDate: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  }

  toPendingAssignmentRow(assignment, index) {
    const match = assignment.match;
    const homeTeam = match?.homeTeam?.name || "Home team";
    const awayTeam = match?.awayTeam?.name || "Away team";
    const venue = match?.venue;
    const competitionLabel = match?.competition?.name || null;
    const roundLabel = match?.round ? `Round ${match.round}` : null;
    const matchNumberLabel = match?.matchNumber
      ? `Match ${match.matchNumber}`
      : null;
    const otherAssignments = (match?.refereeAssignments || [])
      .filter(
        (matchAssignment) =>
          matchAssignment.refereeId !== assignment.refereeId &&
          ACTIVE_ASSIGNMENT_STATUSES.includes(matchAssignment.status),
      )
      .sort((first, second) =>
        this.getRefereeRoleNumber(first.role).localeCompare(
          this.getRefereeRoleNumber(second.role),
        ),
      );

    return {
      id:
        assignment.id || assignment.matchId || match?.id || `pending-${index}`,
      matchId: assignment.matchId,
      role: assignment.role,
      roleNumber: this.getRefereeRoleNumber(assignment.role),
      dateInfo: this.formatPendingAssignmentDate(match?.scheduledAt),
      homeTeamLabel: homeTeam,
      awayTeamLabel: awayTeam,
      matchLabel: `${homeTeam} vs ${awayTeam}`,
      competitionLabel,
      roundLabel,
      matchNumberLabel,
      detailChips: [competitionLabel, roundLabel, matchNumberLabel]
        .filter(Boolean)
        .map((label, chipIndex) => ({
          label,
          tone: chipIndex === 0 ? "competition" : "neutral",
        })),
      venueLabel: venue
        ? [venue.name, venue.city].filter(Boolean).join(", ")
        : "Venue not set",
      delegateLabel: this.getUserDisplayName(match?.delegate, null),
      otherReferees: otherAssignments.map((matchAssignment, refereeIndex) => {
        const name = this.getUserDisplayName(
          matchAssignment.referee?.user,
          "Colleague",
        );

        return {
          id:
            matchAssignment.refereeId ||
            matchAssignment.id ||
            `referee-${refereeIndex}`,
          name,
          initials: this.getInitials(name),
          role: matchAssignment.role,
          roleLabel: this.getHistoryRoleLabel(matchAssignment.role),
        };
      }),
    };
  }

  async getPendingAssignments(refereeId) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const rows = await MatchReferee.findAll({
      where: { refereeId, status: "pending" },
      include: [
        {
          model: Match,
          as: "match",
          required: true,
          where: { status: { [Op.ne]: "cancelled" } },
          include: [
            { model: Competition, as: "competition" },
            { model: Team, as: "homeTeam" },
            { model: Team, as: "awayTeam" },
            { model: Venue, as: "venue" },
            {
              model: User,
              as: "delegate",
              attributes: ["id", "firstName", "lastName"],
            },
            {
              model: MatchReferee,
              as: "refereeAssignments",
              required: false,
              where: { status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES } },
              include: [
                {
                  model: Referee,
                  as: "referee",
                  include: [
                    {
                      model: User,
                      as: "user",
                      attributes: ["id", "firstName", "lastName", "avatarUrl"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: Match, as: "match" }, "scheduledAt", "ASC"]],
    });

    return {
      data: rows.map((assignment, index) =>
        this.toPendingAssignmentRow(assignment, index),
      ),
    };
  }

  matchesCompletedHistorySearch(assignment, normalizedSearch) {
    const match = assignment.match;
    const competition = match?.competition;
    const homeTeam = match?.homeTeam;
    const awayTeam = match?.awayTeam;
    const venue = match?.venue;

    const searchText = [
      homeTeam?.name,
      homeTeam?.shortName,
      homeTeam?.city,
      awayTeam?.name,
      awayTeam?.shortName,
      awayTeam?.city,
      competition?.name,
      competition?.shortName,
      venue?.name,
      venue?.city,
      match?.round,
      match?.matchNumber,
      assignment.role,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(normalizedSearch);
  }

  formatHistoryDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${date.getFullYear()}`;
  }

  getHistoryRoleLabel(role) {
    const labels = {
      first_referee: "1st Referee",
      second_referee: "2nd Referee",
      third_referee: "3rd Referee",
    };

    return labels[role] || "Referee";
  }

  toCompletedHistoryRow(assignment, index) {
    const match = assignment.match;
    const homeTeam = match?.homeTeam?.name || "Home Team";
    const awayTeam = match?.awayTeam?.name || "Away Team";
    const homeScore = match?.homeScore ?? match?.home_score;
    const awayScore = match?.awayScore ?? match?.away_score;

    return {
      id:
        assignment.id || assignment.matchId || match?.id || `history-${index}`,
      dateLabel: this.formatHistoryDate(match?.scheduledAt),
      matchLabel: `${homeTeam} vs ${awayTeam}`,
      competitionId: match?.competitionId || match?.competition_id,
      competitionLabel: match?.competition?.name || "Competition",
      venueLabel: [match?.venue?.name, match?.venue?.city]
        .filter(Boolean)
        .join(", "),
      roleKey: assignment.role,
      roleLabel: this.getHistoryRoleLabel(assignment.role),
      resultLabel:
        homeScore === null ||
        homeScore === undefined ||
        awayScore === null ||
        awayScore === undefined
          ? "-"
          : `${homeScore} : ${awayScore}`,
    };
  }

  async getCompletedHistory(refereeId, query = {}) {
    const { page = 1, limit = 10, search = "", competitionId, role } = query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const where = { refereeId, status: "accepted" };
    const matchWhere = { status: "completed" };
    const normalizedSearch = String(search).trim().toLowerCase();

    if (role && role !== "all") where.role = role;
    if (competitionId && competitionId !== "all") {
      matchWhere.competitionId = competitionId;
    }

    const rows = await MatchReferee.findAll({
      where,
      include: [
        {
          model: Match,
          as: "match",
          where: matchWhere,
          required: true,
          include: [
            { model: Competition, as: "competition" },
            { model: Team, as: "homeTeam" },
            { model: Team, as: "awayTeam" },
            { model: Venue, as: "venue" },
            {
              model: User,
              as: "delegate",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      order: [[{ model: Match, as: "match" }, "scheduledAt", "DESC"]],
    });

    const filteredRows = normalizedSearch
      ? rows.filter((assignment) =>
          this.matchesCompletedHistorySearch(assignment, normalizedSearch),
        )
      : rows;

    return {
      data: filteredRows
        .slice(offset, offset + limitNum)
        .map((assignment, index) =>
          this.toCompletedHistoryRow(assignment, offset + index),
        ),
      pagination: {
        total: filteredRows.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredRows.length / limitNum),
      },
    };
  }

  async getCompletedHistoryStatistics(refereeId) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const includeCompletedMatch = () => [
      {
        model: Match,
        as: "match",
        where: { status: "completed" },
        required: true,
        attributes: [],
      },
    ];
    const baseWhere = { refereeId, status: "accepted" };

    const [total, first, second, third] = await Promise.all([
      MatchReferee.count({
        where: baseWhere,
        include: includeCompletedMatch(),
      }),
      MatchReferee.count({
        where: { ...baseWhere, role: "first_referee" },
        include: includeCompletedMatch(),
      }),
      MatchReferee.count({
        where: { ...baseWhere, role: "second_referee" },
        include: includeCompletedMatch(),
      }),
      MatchReferee.count({
        where: { ...baseWhere, role: "third_referee" },
        include: includeCompletedMatch(),
      }),
    ]);

    return { total, first, second, third };
  }

  async getStatistics(refereeId) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const includeNonCancelledMatch = () => [
      {
        model: Match,
        as: "match",
        where: { status: { [Op.ne]: "cancelled" } },
        required: true,
        attributes: [],
      },
    ];

    const [
      totalAssignments,
      acceptedAssignments,
      declinedAssignments,
      pendingAssignments,
      firstRefereeAssignments,
    ] = await Promise.all([
      MatchReferee.count({
        where: { refereeId, status: { [Op.ne]: "cancelled" } },
        include: includeNonCancelledMatch(),
      }),
      MatchReferee.count({
        where: { refereeId, status: "accepted" },
        include: includeNonCancelledMatch(),
      }),
      MatchReferee.count({
        where: { refereeId, status: "declined" },
        include: includeNonCancelledMatch(),
      }),
      MatchReferee.count({
        where: { refereeId, status: "pending" },
        include: includeNonCancelledMatch(),
      }),
      MatchReferee.count({
        where: {
          refereeId,
          role: "first_referee",
          status: "accepted",
        },
        include: includeNonCancelledMatch(),
      }),
    ]);

    return {
      total: totalAssignments,
      accepted: acceptedAssignments,
      declined: declinedAssignments,
      pending: pendingAssignments,
      firstRefereeCount: firstRefereeAssignments,
    };
  }

  getDashboardMatchInclude(matchWhere = {}, withDetails = false) {
    return [
      {
        model: Match,
        as: "match",
        where: matchWhere,
        required: true,
        include: withDetails
          ? [
              { model: Competition, as: "competition" },
              { model: Team, as: "homeTeam" },
              { model: Team, as: "awayTeam" },
              { model: Venue, as: "venue" },
            ]
          : [],
      },
    ];
  }

  toDashboardMatchRow(assignment) {
    const match = assignment.match;
    const venue = match?.venue;

    return {
      id: assignment.id,
      matchId: assignment.matchId,
      status: assignment.status,
      role: assignment.role,
      dateInfo: this.formatDashboardDate(match?.scheduledAt),
      competitionLabel: match?.competition?.name || "Competition",
      matchLabel: `${match?.homeTeam?.name || "Home team"} vs ${
        match?.awayTeam?.name || "Away team"
      }`,
      venueLabel: venue
        ? [venue.name, venue.city].filter(Boolean).join(", ")
        : "Venue not set",
    };
  }

  async getDashboard(refereeId, query = {}) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const now = new Date();
    const { start: currentMonthStart, end: currentMonthEnd } =
      this.getMonthRange(now);
    const { start: selectedMonthStart, end: selectedMonthEnd } =
      this.getMonthRange(query.month);

    const matchInCurrentMonth = {
      status: { [Op.ne]: "cancelled" },
      scheduledAt: {
        [Op.gte]: currentMonthStart,
        [Op.lt]: currentMonthEnd,
      },
    };
    const futureMatch = {
      status: { [Op.ne]: "cancelled" },
      scheduledAt: { [Op.gte]: now },
    };
    const selectedMonthMatch = {
      status: { [Op.ne]: "cancelled" },
      scheduledAt: {
        [Op.gte]: selectedMonthStart,
        [Op.lt]: selectedMonthEnd,
      },
    };
    const acceptedAssignmentWhere = {
      refereeId,
      status: "accepted",
    };
    const activeAssignmentWhere = {
      refereeId,
      status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES },
    };

    const [statistics, thisMonth, upcoming, upcomingRows, calendarRows] =
      await Promise.all([
        this.getStatistics(refereeId),
        MatchReferee.count({
          where: acceptedAssignmentWhere,
          include: this.getDashboardMatchInclude(matchInCurrentMonth),
        }),
        MatchReferee.count({
          where: activeAssignmentWhere,
          include: this.getDashboardMatchInclude(futureMatch),
        }),
        MatchReferee.findAll({
          where: activeAssignmentWhere,
          include: this.getDashboardMatchInclude(futureMatch, true),
          order: [[{ model: Match, as: "match" }, "scheduledAt", "ASC"]],
          limit: 5,
        }),
        MatchReferee.findAll({
          where: acceptedAssignmentWhere,
          include: this.getDashboardMatchInclude(selectedMonthMatch),
          order: [[{ model: Match, as: "match" }, "scheduledAt", "ASC"]],
        }),
      ]);

    const calendarDateKeys = new Set(
      calendarRows
        .map((assignment) => assignment.match?.scheduledAt)
        .filter(Boolean)
        .map((dateValue) => this.toLocalDateKey(new Date(dateValue))),
    );

    return {
      summary: {
        thisMonth,
        upcoming,
        firstRefereeCount: statistics.firstRefereeCount || 0,
        seasonTotal: statistics.accepted || 0,
      },
      assignmentStatus: {
        total: statistics.total || 0,
        accepted: statistics.accepted || 0,
        pending: statistics.pending || 0,
        declined: statistics.declined || 0,
      },
      pendingCount: statistics.pending || 0,
      upcomingMatches: upcomingRows.map((assignment) =>
        this.toDashboardMatchRow(assignment),
      ),
      calendar: this.getDashboardCalendar(selectedMonthStart, calendarDateKeys),
    };
  }

  async getAvailableForDate(date) {
    const unavailableRefereeIds = await RefereeAvailability.findAll({
      where: {
        date,
        isAvailable: false,
        approvalStatus: { [Op.in]: BLOCKING_AVAILABILITY_STATUSES },
      },
      attributes: ["refereeId"],
    }).then((results) => results.map((r) => r.refereeId));

    const referees = await Referee.findAll({
      where: {
        id: { [Op.notIn]: unavailableRefereeIds },
      },
      include: [
        {
          model: User,
          as: "user",
          where: { status: "active" },
        },
      ],
    });

    return referees;
  }

  async getOverallStatistics() {
    const [total, black, green, white, none, active, inactive, suspended] =
      await Promise.all([
        Referee.count(),
        Referee.count({ where: { licenseCategory: "black" } }),
        Referee.count({ where: { licenseCategory: "green" } }),
        Referee.count({ where: { licenseCategory: "white" } }),
        Referee.count({ where: { licenseCategory: "none" } }),
        Referee.count({
          include: [{ model: User, as: "user", where: { status: "active" } }],
        }),
        Referee.count({
          include: [{ model: User, as: "user", where: { status: "inactive" } }],
        }),
        Referee.count({
          include: [
            { model: User, as: "user", where: { status: "suspended" } },
          ],
        }),
      ]);

    const today = new Date();
    const todayKey = this.toLocalDateKey(today);
    const { start: todayStart, end: tomorrowStart } =
      this.getLocalDayRange(today);

    const [activeReferees, unavailableTodayRows, assignedTodayRows] =
      await Promise.all([
        Referee.findAll({
          include: [{ model: User, as: "user", where: { status: "active" } }],
          attributes: ["id"],
        }),
        RefereeAvailability.findAll({
          where: {
            date: todayKey,
            isAvailable: false,
            approvalStatus: "approved",
          },
          attributes: ["refereeId"],
          raw: true,
        }),
        MatchReferee.findAll({
          where: { status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES } },
          include: [
            {
              model: Match,
              as: "match",
              where: {
                status: { [Op.ne]: "cancelled" },
                scheduledAt: {
                  [Op.gte]: todayStart,
                  [Op.lt]: tomorrowStart,
                },
              },
              attributes: [],
            },
          ],
          attributes: ["refereeId"],
          raw: true,
        }),
      ]);

    const activeRefereeIds = new Set(activeReferees.map((r) => r.id));
    const blockedActiveRefereeIds = new Set();

    for (const row of unavailableTodayRows) {
      if (activeRefereeIds.has(row.refereeId)) {
        blockedActiveRefereeIds.add(row.refereeId);
      }
    }

    for (const row of assignedTodayRows) {
      if (activeRefereeIds.has(row.refereeId)) {
        blockedActiveRefereeIds.add(row.refereeId);
      }
    }

    const availableToday = Math.max(
      0,
      activeRefereeIds.size - blockedActiveRefereeIds.size,
    );
    const unavailableToday = Math.max(0, total - availableToday);

    return {
      total,
      byLicenseCategory: {
        black,
        green,
        white,
        none,
      },
      byStatus: {
        active,
        inactive,
        suspended,
      },
      availabilityToday: {
        available: availableToday,
        unavailable: unavailableToday,
      },
    };
  }
}

module.exports = new RefereeService();
