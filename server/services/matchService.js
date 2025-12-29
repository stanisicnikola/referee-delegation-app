const { Op } = require("sequelize");
const {
  Match,
  Team,
  Venue,
  Competition,
  MatchReferee,
  Referee,
  User,
  sequelize,
} = require("../models");
const { AppError } = require("../middlewares");

class MatchService {
  async findAll(query = {}) {
    const {
      page = 1,
      limit = 10,
      competitionId,
      teamId,
      venueId,
      status,
      delegationStatus,
      dateFrom,
      dateTo,
      round,
    } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (competitionId) where.competitionId = competitionId;
    if (venueId) where.venueId = venueId;
    if (status) where.status = status;
    if (delegationStatus) where.delegationStatus = delegationStatus;
    if (round) where.round = round;
    if (teamId) {
      where[Op.or] = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }
    if (dateFrom) where.scheduledAt = { [Op.gte]: new Date(dateFrom) };
    if (dateTo) {
      where.scheduledAt = { ...where.scheduledAt, [Op.lte]: new Date(dateTo) };
    }

    const { count, rows } = await Match.findAndCountAll({
      where,
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
        { model: User, as: "delegate" },
        {
          model: MatchReferee,
          as: "refereeAssignments",
          include: [
            {
              model: Referee,
              as: "referee",
              include: [{ model: User, as: "user" }],
            },
          ],
        },
      ],
      limit: limitNum,
      offset,
      order: [["scheduledAt", "ASC"]],
      distinct: true,
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
    const match = await Match.findByPk(id, {
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
        { model: User, as: "delegate" },
        {
          model: MatchReferee,
          as: "refereeAssignments",
          include: [
            {
              model: Referee,
              as: "referee",
              include: [{ model: User, as: "user" }],
            },
          ],
        },
      ],
    });

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    return match;
  }

  async create(matchData) {
    // Check if teams exist
    const homeTeam = await Team.findByPk(matchData.homeTeamId);
    if (!homeTeam) throw new AppError("Home team not found.", 400);

    const awayTeam = await Team.findByPk(matchData.awayTeamId);
    if (!awayTeam) throw new AppError("Away team not found.", 400);

    // Check if competition exists
    const competition = await Competition.findByPk(matchData.competitionId);
    if (!competition) throw new AppError("Competition not found.", 400);

    const match = await Match.create(matchData);
    return this.findById(match.id);
  }

  async update(id, matchData) {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    await match.update(matchData);

    return this.findById(id);
  }

  async updateResult(id, resultData) {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    await match.update({
      homeScore: resultData.homeScore,
      awayScore: resultData.awayScore,
      status: "completed",
    });

    return this.findById(id);
  }

  async delete(id) {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    await match.destroy();

    return { message: "Match deleted successfully." };
  }

  async getUpcoming(limit = 5) {
    const matches = await Match.findAll({
      where: {
        scheduledAt: { [Op.gte]: new Date() },
        status: "scheduled",
      },
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
      ],
      order: [["scheduledAt", "ASC"]],
      limit,
    });

    return matches;
  }

  async getPendingDelegation(query = {}) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Match.findAndCountAll({
      where: {
        delegationStatus: { [Op.in]: ["pending", "partial"] },
        scheduledAt: { [Op.gte]: new Date() },
      },
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
      ],
      limit,
      offset,
      order: [["scheduledAt", "ASC"]],
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

  async getStatistics() {
    const totalMatches = await Match.count();
    const scheduledMatches = await Match.count({
      where: { status: "scheduled" },
    });
    const completedMatches = await Match.count({
      where: { status: "completed" },
    });
    const pendingDelegation = await Match.count({
      where: { delegationStatus: { [Op.in]: ["pending", "partial"] } },
    });

    return {
      total: totalMatches,
      scheduled: scheduledMatches,
      completed: completedMatches,
      pendingDelegation,
    };
  }
}

module.exports = new MatchService();
