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
    const { page = 1, limit = 10, status, dateFrom, dateTo } = query;
    const offset = (page - 1) * limit;

    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const where = { refereeId };
    const matchWhere = {};

    if (status) where.status = status;
    if (dateFrom) matchWhere.scheduledAt = { [Op.gte]: new Date(dateFrom) };
    if (dateTo) {
      matchWhere.scheduledAt = {
        ...matchWhere.scheduledAt,
        [Op.lte]: new Date(dateTo),
      };
    }

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
          ],
        },
      ],
      limit,
      offset,
      order: [[{ model: Match, as: "match" }, "scheduledAt", "DESC"]],
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

  async getStatistics(refereeId) {
    const referee = await Referee.findByPk(refereeId);
    if (!referee) {
      throw new AppError("Referee not found.", 404);
    }

    const totalAssignments = await MatchReferee.count({ where: { refereeId } });
    const acceptedAssignments = await MatchReferee.count({
      where: { refereeId, status: "accepted" },
    });
    const declinedAssignments = await MatchReferee.count({
      where: { refereeId, status: "declined" },
    });
    const pendingAssignments = await MatchReferee.count({
      where: { refereeId, status: "pending" },
    });

    return {
      total: totalAssignments,
      accepted: acceptedAssignments,
      declined: declinedAssignments,
      pending: pendingAssignments,
    };
  }

  async getAvailableForDate(date) {
    const unavailableRefereeIds = await RefereeAvailability.findAll({
      where: { date, isAvailable: false },
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
    const [
      total,
      international,
      A,
      B,
      C,
      regional,
      active,
      inactive,
      suspended,
    ] = await Promise.all([
      Referee.count(),
      Referee.count({ where: { licenseCategory: "international" } }),
      Referee.count({ where: { licenseCategory: "A" } }),
      Referee.count({ where: { licenseCategory: "B" } }),
      Referee.count({ where: { licenseCategory: "C" } }),
      Referee.count({ where: { licenseCategory: "regional" } }),
      Referee.count({
        include: [{ model: User, as: "user", where: { status: "active" } }],
      }),
      Referee.count({
        include: [{ model: User, as: "user", where: { status: "inactive" } }],
      }),
      Referee.count({
        include: [{ model: User, as: "user", where: { status: "suspended" } }],
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
          where: { date: todayKey, isAvailable: false },
          attributes: ["refereeId"],
          raw: true,
        }),
        MatchReferee.findAll({
          where: { status: { [Op.ne]: "declined" } },
          include: [
            {
              model: Match,
              as: "match",
              where: {
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
      byCategory: {
        international,
        A,
        B,
        C,
        regional,
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
