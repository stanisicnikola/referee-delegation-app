const { Op } = require("sequelize");
const {
  Referee,
  User,
  MatchReferee,
  RefereeAvailability,
  Match,
  sequelize,
} = require("../models");
const { AppError } = require("../middlewares");

class RefereeService {
  async findAll(query = {}) {
    const { page = 1, limit = 10, licenseCategory, city, search } = query;
    const offset = (page - 1) * limit;

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
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        },
      ],
      limit,
      offset,
      order: [[{ model: User, as: "user" }, "lastName", "ASC"]],
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
        400
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
          400
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
}

module.exports = new RefereeService();
