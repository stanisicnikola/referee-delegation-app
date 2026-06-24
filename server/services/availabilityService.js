const { Op } = require("sequelize");
const {
  Match,
  MatchReferee,
  RefereeAvailability,
  Referee,
  User,
  sequelize,
} = require("../models");
const { AppError } = require("../middlewares");

const ACTIVE_ASSIGNMENT_STATUSES = ["pending", "accepted"];
const BLOCKING_AVAILABILITY_STATUSES = ["approved"];

class AvailabilityService {
  toDateKey(value) {
    if (!value) return null;
    if (typeof value === "string") return value.split("T")[0];
    return value.toISOString().split("T")[0];
  }

  toLocalDateKey(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getApprovalStatus(isAvailable, approvalStatus, defaultApprovalStatus) {
    if (isAvailable) return "approved";
    return approvalStatus || defaultApprovalStatus || "approved";
  }

  parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  parseDateKey(dateKey) {
    const [year, month, day] = String(dateKey).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  addUtcDays(date, amount) {
    const copy = new Date(date);
    copy.setUTCDate(copy.getUTCDate() + amount);
    return copy;
  }

  getDateKeysBetween(dateFrom, dateTo = dateFrom) {
    const dates = [];
    let currentDate = this.parseDateKey(dateFrom);
    const endDate = this.parseDateKey(dateTo);

    while (currentDate <= endDate) {
      dates.push(this.toDateKey(currentDate));
      currentDate = this.addUtcDays(currentDate, 1);
    }

    return dates;
  }

  formatConflictDates(dateKeys) {
    return dateKeys.slice(0, 3).join(", ");
  }

  getDelegationStatus(assignments) {
    const activeAssignments = assignments.filter((assignment) =>
      ACTIVE_ASSIGNMENT_STATUSES.includes(assignment.status),
    );

    if (activeAssignments.length === 0) return "pending";
    if (activeAssignments.length < 3) return "partial";

    return activeAssignments.every(
      (assignment) => assignment.status === "accepted",
    )
      ? "confirmed"
      : "complete";
  }

  async getAssignmentsForDateKeys(refereeId, dateKeys, statuses, transaction) {
    if (!dateKeys.length) return [];

    const dateKeySet = new Set(dateKeys);
    const assignments = await MatchReferee.findAll({
      where: {
        refereeId,
        status: { [Op.in]: statuses },
      },
      include: [
        {
          model: Match,
          as: "match",
          required: true,
          where: { status: { [Op.ne]: "cancelled" } },
        },
      ],
      transaction,
    });

    return assignments.filter((assignment) =>
      dateKeySet.has(this.toDateKey(assignment.match?.scheduledAt)),
    );
  }

  async assertNoAcceptedAssignments(refereeId, dateKeys, transaction) {
    const acceptedAssignments = await this.getAssignmentsForDateKeys(
      refereeId,
      dateKeys,
      ["accepted"],
      transaction,
    );

    if (acceptedAssignments.length === 0) return;

    const conflictDates = [
      ...new Set(
        acceptedAssignments
          .map((assignment) => this.toDateKey(assignment.match?.scheduledAt))
          .filter(Boolean),
      ),
    ].sort();

    throw new AppError(
      `You already accepted a match on ${this.formatConflictDates(conflictDates)}. Remove that match assignment before reporting unavailability for that date.`,
      400,
    );
  }

  getUnavailabilityAssignmentNote(reason, description) {
    const parts = ["Unavailable request", reason, description?.trim()].filter(
      Boolean,
    );
    return parts.join(": ");
  }

  async releasePendingAssignmentsForDates(
    refereeId,
    dateKeys,
    reason,
    description,
    transaction,
  ) {
    const pendingAssignments = await this.getAssignmentsForDateKeys(
      refereeId,
      dateKeys,
      ["pending"],
      transaction,
    );

    if (pendingAssignments.length === 0) return 0;

    const now = new Date();
    const affectedMatchIds = [
      ...new Set(pendingAssignments.map((assignment) => assignment.matchId)),
    ];

    for (const assignment of pendingAssignments) {
      await assignment.update(
        {
          status: "declined",
          responseAt: now,
          declineReason: "unavailable",
          notes: this.getUnavailabilityAssignmentNote(reason, description),
        },
        { transaction },
      );
    }

    for (const matchId of affectedMatchIds) {
      const match = await Match.findByPk(matchId, { transaction });
      if (!match) continue;

      const assignments = await MatchReferee.findAll({
        where: { matchId },
        transaction,
      });
      await match.update(
        { delegationStatus: this.getDelegationStatus(assignments) },
        { transaction },
      );
    }

    return pendingAssignments.length;
  }

  /**
   * Get referee availability
   * @param {string} refereeId - Referee ID
   * @param {object} query - Query parameters
   */
  async getByReferee(refereeId, query = {}) {
    const { page = 1, limit = 30, dateFrom, dateTo, month, year } = query;
    const pageNumber = this.parsePositiveInt(page, 1);
    const limitNumber = this.parsePositiveInt(limit, 30);
    const offset = (pageNumber - 1) * limitNumber;

    const where = { refereeId };

    if (dateFrom) where.date = { [Op.gte]: new Date(dateFrom) };
    if (dateTo) {
      where.date = { ...where.date, [Op.lte]: new Date(dateTo) };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      };
    }

    const { count, rows } = await RefereeAvailability.findAndCountAll({
      where,
      limit: limitNumber,
      offset,
      order: [["date", "ASC"]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(count / limitNumber),
      },
    };
  }

  /**
   * Set availability for referee
   * @param {string} refereeId - Referee ID
   * @param {object} data - Availability data
   */
  async setAvailability(refereeId, data, options = {}) {
    const { date, isAvailable, reason, description, approvalStatus } = data;
    const status = this.getApprovalStatus(
      isAvailable,
      approvalStatus,
      options.defaultApprovalStatus,
    );

    if (options.disallowPast && date < this.toLocalDateKey()) {
      throw new AppError("Past dates cannot be selected.", 400);
    }

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const transaction = await sequelize.transaction();

    try {
      const dateKeys = this.getDateKeysBetween(date);

      if (options.disallowAcceptedAssignments && isAvailable === false) {
        await this.assertNoAcceptedAssignments(
          refereeId,
          dateKeys,
          transaction,
        );
      }

      const [availability, created] = await RefereeAvailability.findOrCreate({
        where: { refereeId, date },
        defaults: {
          isAvailable,
          reason: isAvailable ? null : reason || null,
          description: isAvailable ? null : description || null,
          approvalStatus: status,
          reviewedBy: status === "pending" ? null : options.reviewedBy || null,
          reviewedAt: status === "pending" ? null : options.reviewedAt || null,
        },
        transaction,
      });

      if (!created) {
        await availability.update(
          {
            isAvailable,
            reason: isAvailable ? null : reason || null,
            description: isAvailable ? null : description || null,
            approvalStatus: status,
            reviewedBy:
              status === "pending" ? null : options.reviewedBy || null,
            reviewedAt:
              status === "pending" ? null : options.reviewedAt || null,
          },
          { transaction },
        );
      }

      if (options.releasePendingAssignments && isAvailable === false) {
        await this.releasePendingAssignmentsForDates(
          refereeId,
          dateKeys,
          reason,
          description,
          transaction,
        );
      }

      await transaction.commit();

      return availability;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Set availability for date range
   * @param {string} refereeId - Referee ID
   * @param {object} data - Availability data
   */
  async setAvailabilityRange(refereeId, data, options = {}) {
    const {
      dateFrom,
      dateTo,
      isAvailable,
      reason,
      description,
      approvalStatus,
    } = data;
    const status = this.getApprovalStatus(
      isAvailable,
      approvalStatus,
      options.defaultApprovalStatus,
    );

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    if (options.disallowPast && dateFrom < this.toLocalDateKey()) {
      throw new AppError("Past dates cannot be selected.", 400);
    }

    if (startDate > endDate) {
      throw new AppError("Start date must be before end date.", 400);
    }

    const dateKeys = this.getDateKeysBetween(dateFrom, dateTo);
    const transaction = await sequelize.transaction();

    try {
      if (options.disallowAcceptedAssignments && isAvailable === false) {
        await this.assertNoAcceptedAssignments(
          refereeId,
          dateKeys,
          transaction,
        );
      }

      const dates = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await RefereeAvailability.destroy({
        where: {
          refereeId,
          date: { [Op.between]: [startDate, endDate] },
        },
        transaction,
      });

      const availabilities = dates.map((date) => ({
        refereeId,
        date,
        isAvailable,
        reason: isAvailable ? null : reason || null,
        description: isAvailable ? null : description || null,
        approvalStatus: status,
        reviewedBy: status === "pending" ? null : options.reviewedBy || null,
        reviewedAt: status === "pending" ? null : options.reviewedAt || null,
      }));

      await RefereeAvailability.bulkCreate(availabilities, { transaction });

      const releasedAssignments =
        options.releasePendingAssignments && isAvailable === false
          ? await this.releasePendingAssignmentsForDates(
              refereeId,
              dateKeys,
              reason,
              description,
              transaction,
            )
          : 0;

      await transaction.commit();

      return {
        message:
          releasedAssignments > 0
            ? `Availability set for ${dates.length} days. Released ${releasedAssignments} pending assignment${releasedAssignments === 1 ? "" : "s"}.`
            : `Availability set for ${dates.length} days.`,
        count: dates.length,
        releasedAssignments,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete availability
   * @param {string} id - Availability record ID
   */
  async delete(id, options = {}) {
    const where = { id };
    if (options.refereeId) {
      where.refereeId = options.refereeId;
    }

    const availability = await RefereeAvailability.findOne({ where });

    if (!availability) {
      throw new AppError("Availability record not found.", 404);
    }

    await availability.destroy();

    return { message: "Availability deleted." };
  }

  /**
   * Delete availability by date
   * @param {string} refereeId - Referee ID
   * @param {string} date - Date
   */
  async deleteByDate(refereeId, date) {
    const availability = await RefereeAvailability.findOne({
      where: { refereeId, date },
    });

    if (!availability) {
      throw new AppError("Availability record not found.", 404);
    }

    await availability.destroy();

    return { message: "Availability deleted." };
  }

  /**
   * Get unavailable referees for a specific date
   * @param {string} date - Date
   */
  async getUnavailableReferees(date) {
    const unavailable = await RefereeAvailability.findAll({
      where: { date, isAvailable: false, approvalStatus: "approved" },
      include: [
        {
          model: Referee,
          as: "referee",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    return unavailable;
  }

  /**
   * Get available referees for a specific date
   * @param {string} date - Date
   */
  async getAvailableReferees(date) {
    const unavailableReferees = await RefereeAvailability.findAll({
      where: {
        date,
        isAvailable: false,
        approvalStatus: { [Op.in]: BLOCKING_AVAILABILITY_STATUSES },
      },
      attributes: ["refereeId"],
    });

    const unavailableIds = unavailableReferees.map((a) => a.refereeId);

    const whereClause = {};
    if (unavailableIds.length > 0) {
      whereClause.id = { [Op.notIn]: unavailableIds };
    }

    const availableReferees = await Referee.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          where: { status: "active" },
        },
      ],
      order: [[{ model: User, as: "user" }, "lastName", "ASC"]],
    });

    return availableReferees;
  }

  /**
   * Get availability calendar for referee (by month)
   * @param {string} refereeId - Referee ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   */
  async getCalendar(refereeId, year, month) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const availabilities = await RefereeAvailability.findAll({
      where: {
        refereeId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [["date", "ASC"]],
    });

    const calendar = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const availability = availabilities.find(
        (a) => this.toDateKey(a.date) === dateStr,
      );

      calendar.push({
        id: availability?.id || null,
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        isAvailable: availability ? availability.isAvailable : true,
        reason: availability?.reason || null,
        description: availability?.description || null,
        approvalStatus: availability?.approvalStatus || null,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      year,
      month,
      refereeId,
      calendar,
    };
  }

  /**
   * Copy availability from previous month
   * @param {string} refereeId - Referee ID
   * @param {number} year - Target year
   * @param {number} month - Target month
   */
  async copyFromPreviousMonth(refereeId, year, month) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
    const prevEndDate = new Date(prevYear, prevMonth, 0);

    const previousAvailabilities = await RefereeAvailability.findAll({
      where: {
        refereeId,
        date: { [Op.between]: [prevStartDate, prevEndDate] },
        isAvailable: false,
        approvalStatus: "approved",
      },
    });

    if (previousAvailabilities.length === 0) {
      return {
        message: "No data to copy from previous month.",
        count: 0,
      };
    }

    const transaction = await sequelize.transaction();

    try {
      const newAvailabilities = [];
      const targetStartDate = new Date(year, month - 1, 1);
      const daysInTargetMonth = new Date(year, month, 0).getDate();

      for (const prev of previousAvailabilities) {
        const dayOfMonth = prev.date.getDate();

        if (dayOfMonth <= daysInTargetMonth) {
          const newDate = new Date(year, month - 1, dayOfMonth);
          newAvailabilities.push({
            refereeId,
            date: newDate,
            isAvailable: prev.isAvailable,
            reason: prev.reason,
            description: prev.description,
            approvalStatus: "approved",
          });
        }
      }

      const targetEndDate = new Date(year, month, 0);
      await RefereeAvailability.destroy({
        where: {
          refereeId,
          date: { [Op.between]: [targetStartDate, targetEndDate] },
        },
        transaction,
      });

      await RefereeAvailability.bulkCreate(newAvailabilities, {
        transaction,
        ignoreDuplicates: true,
      });

      await transaction.commit();

      return {
        message: `Copied ${newAvailabilities.length} records from previous month.`,
        count: newAvailabilities.length,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getRequests(query = {}) {
    const {
      page = 1,
      limit = 100,
      status = "pending",
      dateFrom,
      dateTo,
    } = query;
    const pageNumber = this.parsePositiveInt(page, 1);
    const limitNumber = this.parsePositiveInt(limit, 100);
    const offset = (pageNumber - 1) * limitNumber;

    const where = { isAvailable: false };
    const minimumDate = dateFrom || this.toLocalDateKey();
    where.date = { [Op.gte]: minimumDate };
    if (dateTo) {
      where.date = { ...where.date, [Op.lte]: dateTo };
    }
    if (status === "all") {
      where[Op.or] = [
        { approvalStatus: "pending" },
        {
          approvalStatus: { [Op.in]: ["approved", "rejected"] },
          reviewedAt: { [Op.ne]: null },
        },
      ];
    } else if (status === "pending") {
      where.approvalStatus = "pending";
    } else {
      where.approvalStatus = status;
      where.reviewedAt = { [Op.ne]: null };
    }

    const { count, rows } = await RefereeAvailability.findAndCountAll({
      where,
      include: [
        {
          model: Referee,
          as: "referee",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email", "avatarUrl"],
            },
          ],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      limit: limitNumber,
      offset,
      order: [
        ["date", "ASC"],
        ["created_at", "ASC"],
      ],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(count / limitNumber),
      },
    };
  }

  async reviewRequests(ids, approvalStatus, reviewedBy) {
    if (!["approved", "rejected"].includes(approvalStatus)) {
      throw new AppError("Invalid approval status.", 400);
    }

    const transaction = await sequelize.transaction();

    try {
      const requests = await RefereeAvailability.findAll({
        where: {
          id: { [Op.in]: ids },
          isAvailable: false,
        },
        transaction,
      });

      if (requests.length === 0) {
        throw new AppError("Availability request not found.", 404);
      }

      if (approvalStatus === "approved") {
        const requestsByReferee = requests.reduce((acc, request) => {
          const dateKey = this.toDateKey(request.date);
          if (!acc.has(request.refereeId)) acc.set(request.refereeId, []);
          acc.get(request.refereeId).push(dateKey);
          return acc;
        }, new Map());

        for (const [refereeId, dateKeys] of requestsByReferee.entries()) {
          await this.assertNoAcceptedAssignments(
            refereeId,
            [...new Set(dateKeys)],
            transaction,
          );
        }
      }

      await RefereeAvailability.update(
        {
          approvalStatus,
          reviewedBy,
          reviewedAt: new Date(),
        },
        {
          where: {
            id: { [Op.in]: ids },
            isAvailable: false,
          },
          transaction,
        },
      );

      let releasedAssignments = 0;

      if (approvalStatus === "approved") {
        for (const request of requests) {
          releasedAssignments += await this.releasePendingAssignmentsForDates(
            request.refereeId,
            [this.toDateKey(request.date)],
            request.reason,
            request.description,
            transaction,
          );
        }
      }

      await transaction.commit();

      return {
        message:
          approvalStatus === "approved"
            ? "Availability request approved."
            : "Availability request rejected.",
        count: requests.length,
        releasedAssignments,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new AvailabilityService();
