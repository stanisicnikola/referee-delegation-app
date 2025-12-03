const { Op } = require("sequelize");
const { Team, Venue } = require("../models");
const { AppError } = require("../middlewares");

class TeamService {
  async findAll(query = {}) {
    const { page = 1, limit = 10, city, status, search } = query;
    const offset = (page - 1) * limit;

    const where = {};

    if (city) where.city = { [Op.like]: `%${city}%` };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { shortName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Team.findAndCountAll({
      where,
      include: [{ model: Venue, as: "primaryVenue" }],
      limit,
      offset,
      order: [["name", "ASC"]],
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
    const team = await Team.findByPk(id, {
      include: [{ model: Venue, as: "primaryVenue" }],
    });

    if (!team) {
      throw new AppError("Team not found.", 404);
    }

    return team;
  }

  async create(teamData) {
    const team = await Team.create(teamData);
    return this.findById(team.id);
  }

  async update(id, teamData) {
    const team = await Team.findByPk(id);

    if (!team) {
      throw new AppError("Team not found.", 404);
    }

    await team.update(teamData);

    return this.findById(id);
  }

  async delete(id) {
    const team = await Team.findByPk(id);

    if (!team) {
      throw new AppError("Team not found.", 404);
    }

    await team.destroy();

    return { message: "Team deleted successfully." };
  }

  async updateLogo(id, logoUrl) {
    const team = await Team.findByPk(id);

    if (!team) {
      throw new AppError("Team not found.", 404);
    }

    await team.update({ logoUrl });

    return this.findById(id);
  }
}

module.exports = new TeamService();
