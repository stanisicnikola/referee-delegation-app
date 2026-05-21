const { Op } = require("sequelize");
const { RefereeAvailability, Referee, User, sequelize } = require("../models");
const { AppError } = require("../middlewares");

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

    // If month and year are provided, filter by them
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
      options.defaultApprovalStatus
    );

    if (options.disallowPast && date < this.toLocalDateKey()) {
      throw new AppError("Past dates cannot be selected.", 400);
    }

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    // Upsert - create or update
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
    });

    if (!created) {
      await availability.update({
        isAvailable,
        reason: isAvailable ? null : reason || null,
        description: isAvailable ? null : description || null,
        approvalStatus: status,
        reviewedBy: status === "pending" ? null : options.reviewedBy || null,
        reviewedAt: status === "pending" ? null : options.reviewedAt || null,
      });
    }

    return availability;
  }

  /**
   * Set availability for date range
   * @param {string} refereeId - Referee ID
   * @param {object} data - Availability data
   */
  async setAvailabilityRange(refereeId, data, options = {}) {
    const { dateFrom, dateTo, isAvailable, reason, description, approvalStatus } =
      data;
    const status = this.getApprovalStatus(
      isAvailable,
      approvalStatus,
      options.defaultApprovalStatus
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

    const transaction = await sequelize.transaction();

    try {
      const dates = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Delete existing records for this range
      await RefereeAvailability.destroy({
        where: {
          refereeId,
          date: { [Op.between]: [startDate, endDate] },
        },
        transaction,
      });

      // Create new records
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

      await transaction.commit();

      return {
        message: `Availability set for ${dates.length} days.`,
        count: dates.length,
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
    // Get referees who are explicitly unavailable
    const unavailableReferees = await RefereeAvailability.findAll({
      where: { date, isAvailable: false, approvalStatus: "approved" },
      attributes: ["refereeId"],
    });

    const unavailableIds = unavailableReferees.map((a) => a.refereeId);

    // Get all active referees who are not on the unavailable list
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

    // Generate calendar for entire month
    const calendar = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const availability = availabilities.find(
        (a) => this.toDateKey(a.date) === dateStr
      );

      calendar.push({
        id: availability?.id || null,
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        isAvailable: availability ? availability.isAvailable : true, // Po defaultu dostupan
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

    // Determine previous month
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

        // Ako taj dan postoji u ciljnom mjesecu
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

      // Delete existing and add new
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

  /**
   * Get submitted unavailable periods for delegate/admin review.
   */
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

  /**
   * Approve or reject submitted unavailable dates.
   */
  async reviewRequests(ids, approvalStatus, reviewedBy) {
    if (!["approved", "rejected"].includes(approvalStatus)) {
      throw new AppError("Invalid approval status.", 400);
    }

    const requests = await RefereeAvailability.findAll({
      where: {
        id: { [Op.in]: ids },
        isAvailable: false,
      },
    });

    if (requests.length === 0) {
      throw new AppError("Availability request not found.", 404);
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
      }
    );

    return {
      message:
        approvalStatus === "approved"
          ? "Availability request approved."
          : "Availability request rejected.",
      count: requests.length,
    };
  }
}

module.exports = new AvailabilityService();
