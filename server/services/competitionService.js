const { Op } = require("sequelize");
const { Competition, Match } = require("../models");
const { AppError } = require("../middlewares");

class CompetitionService {
  async findAll(query = {}) {
    const {
      page = 1,
      limit = 10,
      season,
      category,
      status,
      gender,
      search,
    } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (season) where.season = season;
    if (category) where.category = category;
    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { shortName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Competition.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [
        ["season", "DESC"],
        ["name", "ASC"],
      ],
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
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new AppError("Competition not found.", 404);
    }

    return competition;
  }

  async create(competitionData) {
    const competition = await Competition.create(competitionData);
    return competition;
  }

  async update(id, competitionData) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new AppError("Competition not found.", 404);
    }

    await competition.update(competitionData);

    return competition;
  }

  async delete(id) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new AppError("Competition not found.", 404);
    }

    // Check if there are any matches
    const matchCount = await Match.count({ where: { competitionId: id } });
    if (matchCount > 0) {
      throw new AppError("Cannot delete competition that has matches.", 400);
    }

    await competition.destroy();

    return { message: "Competition deleted successfully." };
  }

  async getSeasons() {
    const seasons = await Competition.findAll({
      attributes: ["season"],
      group: ["season"],
      order: [["season", "DESC"]],
    });

    return seasons.map((s) => s.season);
  }

  async getStatistics(id) {
    const competition = await Competition.findByPk(id);
    if (!competition) {
      throw new AppError("Competition not found.", 404);
    }

    const totalMatches = await Match.count({ where: { competitionId: id } });
    const completedMatches = await Match.count({
      where: { competitionId: id, status: "completed" },
    });
    const scheduledMatches = await Match.count({
      where: { competitionId: id, status: "scheduled" },
    });

    return {
      totalMatches,
      completedMatches,
      scheduledMatches,
      completionRate:
        totalMatches > 0
          ? Math.round((completedMatches / totalMatches) * 100)
          : 0,
    };
  }
}

module.exports = new CompetitionService();
