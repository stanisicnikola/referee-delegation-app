const { Op } = require("sequelize");
const { RefereeAvailability, Referee, User, sequelize } = require("../models");
const { AppError } = require("../middlewares");

class AvailabilityService {
  /**
   * Get referee availability
   * @param {string} refereeId - Referee ID
   * @param {object} query - Query parameters
   */
  async getByReferee(refereeId, query = {}) {
    const { page = 1, limit = 30, dateFrom, dateTo, month, year } = query;
    const offset = (page - 1) * limit;

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
      limit,
      offset,
      order: [["date", "ASC"]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Set availability for referee
   * @param {string} refereeId - Referee ID
   * @param {object} data - Availability data
   */
  async setAvailability(refereeId, data) {
    const { date, isAvailable, reason } = data;

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    // Upsert - create or update
    const [availability, created] = await RefereeAvailability.findOrCreate({
      where: { refereeId, date },
      defaults: { isAvailable, reason },
    });

    if (!created) {
      await availability.update({ isAvailable, reason });
    }

    return availability;
  }

  /**
   * Set availability for date range
   * @param {string} refereeId - Referee ID
   * @param {object} data - Availability data
   */
  async setAvailabilityRange(refereeId, data) {
    const { dateFrom, dateTo, isAvailable, reason } = data;

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

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
        reason,
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
  async delete(id) {
    const availability = await RefereeAvailability.findByPk(id);

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
      where: { date, isAvailable: false },
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
      where: { date, isAvailable: false },
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
        (a) => a.date.toISOString().split("T")[0] === dateStr
      );

      calendar.push({
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        isAvailable: availability ? availability.isAvailable : true, // Po defaultu dostupan
        reason: availability?.reason || null,
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
}

module.exports = new AvailabilityService();
