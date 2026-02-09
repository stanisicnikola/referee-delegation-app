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

    if (status) {
      const now = new Date().toISOString().split("T")[0];
      if (status === "suspended") {
        where.status = "suspended";
      } else if (status === "active") {
        where[Op.and] = [
          { status: { [Op.ne]: "suspended" } },
          { startDate: { [Op.lte]: now } },
          { endDate: { [Op.gte]: now } },
        ];
      } else if (status === "upcoming") {
        where[Op.and] = [
          { status: { [Op.ne]: "suspended" } },
          { startDate: { [Op.gt]: now } },
        ];
      } else if (status === "completed") {
        where[Op.and] = [
          { status: { [Op.ne]: "suspended" } },
          { endDate: { [Op.lt]: now } },
        ];
      }
    }
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

    const mappedRows = rows.map((comp) => {
      const plainComp = comp.get({ plain: true });
      return {
        ...plainComp,
        status: this._calculateStatus(plainComp),
      };
    });

    return {
      data: mappedRows,
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

    const plainComp = competition.get({ plain: true });
    return {
      ...plainComp,
      status: this._calculateStatus(plainComp),
    };
  }

  _calculateStatus(competition) {
    if (competition.status === "suspended") return "suspended";

    const now = new Date().toISOString().split("T")[0];
    const start = competition.startDate;
    const end = competition.endDate;

    if (!start || !end) return competition.status;

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "active";
  }

  async create(competitionData) {
    const status = this._calculateStatus(competitionData);
    const competition = await Competition.create({
      ...competitionData,
      status,
    });
    return this.findById(competition.id);
  }

  async update(id, competitionData) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new AppError("Competition not found.", 404);
    }

    const dataToCalculate = {
      ...competition.get({ plain: true }),
      ...competitionData,
    };
    const status = this._calculateStatus(dataToCalculate);

    await competition.update({ ...competitionData, status });

    return this.findById(id);
  }

  async delete(id) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new AppError("Competition not found.", 404);
    }

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

  async getGlobalSummary() {
    const competitions = await Competition.findAll();

    const summary = {
      total: competitions.length,
      upcoming: 0,
      active: 0,
      completed: 0,
      suspended: 0,
    };

    competitions.forEach((comp) => {
      const calculatedStatus = this._calculateStatus(comp.get({ plain: true }));
      if (summary[calculatedStatus] !== undefined) {
        summary[calculatedStatus]++;
      }
    });

    return summary;
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
