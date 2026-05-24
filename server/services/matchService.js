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

const ACTIVE_ASSIGNMENT_STATUSES = ["pending", "accepted"];

class MatchService {
  getDelegateScope(actor) {
    return actor?.role === "delegate" ? { delegatedBy: actor.id } : {};
  }

  assertDelegateCanAccessMatch(match, actor) {
    if (actor?.role === "delegate" && match.delegatedBy !== actor.id) {
      throw new AppError("Match not found.", 404);
    }
  }

  async findAll(query = {}, actor = null) {
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
      search,
    } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = { ...this.getDelegateScope(actor) };

    if (competitionId) where.competitionId = competitionId;
    if (venueId) where.venueId = venueId;
    const now = new Date();

    if (status === "scheduled") {
      where.status = "scheduled";
      where.scheduledAt = { [Op.gt]: now };
    } else if (status === "in_progress") {
      where[Op.or] = [
        { status: "in_progress" },
        {
          [Op.and]: [
            { status: { [Op.in]: ["scheduled", "postponed"] } },
            { scheduledAt: { [Op.lte]: now } },
          ],
        },
      ];
    } else if (status) {
      where.status = status;
    }

    if (delegationStatus) where.delegationStatus = delegationStatus;
    if (round) where.round = round;
    if (dateFrom) where.scheduledAt = { [Op.gte]: new Date(dateFrom) };
    if (dateTo) {
      where.scheduledAt = { ...where.scheduledAt, [Op.lte]: new Date(dateTo) };
    }

    const teamFilter = teamId
      ? [{ homeTeamId: teamId }, { awayTeamId: teamId }]
      : null;
    const searchFilter = search
      ? [
          { "$homeTeam.name$": { [Op.like]: `%${search}%` } },
          { "$awayTeam.name$": { [Op.like]: `%${search}%` } },
        ]
      : null;

    if (teamFilter && searchFilter) {
      where[Op.and] = [{ [Op.or]: teamFilter }, { [Op.or]: searchFilter }];
    } else if (teamFilter) {
      where[Op.or] = teamFilter;
    } else if (searchFilter) {
      where[Op.or] = searchFilter;
    }

    const { count, rows } = await Match.findAndCountAll({
      where,
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
        {
          model: User,
          as: "delegate",
          attributes: { exclude: ["passwordHash"] },
        },
        {
          model: MatchReferee,
          as: "refereeAssignments",
          separate: true,
          include: [
            {
              model: Referee,
              as: "referee",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: { exclude: ["passwordHash"] },
                },
              ],
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

  async findById(id, actor = null) {
    const match = await Match.findByPk(id, {
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
        {
          model: User,
          as: "delegate",
          attributes: { exclude: ["passwordHash"] },
        },
        {
          model: MatchReferee,
          as: "refereeAssignments",
          include: [
            {
              model: Referee,
              as: "referee",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: { exclude: ["passwordHash"] },
                },
              ],
            },
          ],
        },
      ],
    });

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    this.assertDelegateCanAccessMatch(match, actor);

    return match;
  }

  async create(matchData, actor = null) {
    const { delegateId, ...data } = matchData;

    if (actor?.role === "delegate") {
      data.delegatedBy = actor.id;
    } else if (actor?.role === "admin") {
      if (!delegateId) {
        throw new AppError("Delegate is required.", 400);
      }

      const delegate = await User.findOne({
        where: { id: delegateId, role: "delegate", status: "active" },
      });
      if (!delegate) throw new AppError("Delegate not found.", 400);

      data.delegatedBy = delegateId;
    }

    // Check if teams exist
    const homeTeam = await Team.findByPk(matchData.homeTeamId);
    if (!homeTeam) throw new AppError("Home team not found.", 400);

    const awayTeam = await Team.findByPk(matchData.awayTeamId);
    if (!awayTeam) throw new AppError("Away team not found.", 400);

    // Check if competition exists
    const competition = await Competition.findByPk(matchData.competitionId);
    if (!competition) throw new AppError("Competition not found.", 400);

    const match = await Match.create(data);
    return this.findById(match.id, actor);
  }

  async update(id, matchData, actor = null) {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    this.assertDelegateCanAccessMatch(match, actor);

    // Map delegateId to delegatedBy
    const { delegateId, ...data } = matchData;
    if (actor?.role === "admin" && delegateId) {
      const delegate = await User.findOne({
        where: { id: delegateId, role: "delegate", status: "active" },
      });
      if (!delegate) throw new AppError("Delegate not found.", 400);

      data.delegatedBy = delegateId;
    }

    if (
      match.status === "cancelled" &&
      data.status &&
      data.status !== "cancelled"
    ) {
      throw new AppError("Cancelled matches cannot be reopened.", 400);
    }

    if (data.status === "cancelled") {
      if (!data.statusReason?.trim()) {
        throw new AppError("Cancellation reason is required.", 400);
      }
      data.statusReason = data.statusReason.trim();
    }

    if (data.status === "postponed") {
      if (!data.scheduledAt) {
        throw new AppError("New match date and time are required.", 400);
      }
      if (new Date(data.scheduledAt) <= new Date()) {
        throw new AppError("New match date and time must be in the future.", 400);
      }
      if (!data.statusReason?.trim()) {
        throw new AppError("Postponement reason is required.", 400);
      }
      data.statusReason = data.statusReason.trim();
    }

    if (data.status === "cancelled") {
      const transaction = await sequelize.transaction();

      try {
        await match.update(data, { transaction });
        await MatchReferee.update(
          {
            status: "cancelled",
            responseAt: new Date(),
          },
          {
            where: {
              matchId: id,
              status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES },
            },
            transaction,
          }
        );

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      return this.findById(id, actor);
    }

    await match.update(data);

    return this.findById(id, actor);
  }

  async updateResult(id, resultData, actor = null) {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    this.assertDelegateCanAccessMatch(match, actor);

    if (match.status === "cancelled") {
      throw new AppError("Cannot complete a cancelled match.", 400);
    }

    if (match.scheduledAt && new Date(match.scheduledAt) > new Date()) {
      throw new AppError("Match cannot be completed before it starts.", 400);
    }

    await match.update({
      homeScore: resultData.homeScore,
      awayScore: resultData.awayScore,
      reportNotes: resultData.reportNotes || null,
      status: "completed",
    });

    return this.findById(id, actor);
  }

  async delete(id, actor = null) {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    this.assertDelegateCanAccessMatch(match, actor);

    await match.destroy();

    return { message: "Match deleted successfully." };
  }

  async getUpcoming(limit = 5, actor = null) {
    const matches = await Match.findAll({
      where: {
        ...this.getDelegateScope(actor),
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

  async getPendingDelegation(query = {}, actor = null) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Match.findAndCountAll({
      where: {
        ...this.getDelegateScope(actor),
        delegationStatus: { [Op.in]: ["pending", "partial"] },
        scheduledAt: { [Op.gte]: new Date() },
        status: { [Op.ne]: "cancelled" },
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
    const now = new Date();
    const totalMatches = await Match.count();

    const scheduledMatches = await Match.count({
      where: {
        status: "scheduled",
        scheduledAt: { [Op.gt]: now },
      },
    });

    const inProgressMatches = await Match.count({
      where: {
        [Op.or]: [
          { status: "in_progress" },
          {
            [Op.and]: [
              { status: "scheduled" },
              { scheduledAt: { [Op.lte]: now } },
            ],
          },
        ],
      },
    });

    const completedMatches = await Match.count({
      where: { status: "completed" },
    });
    const cancelledMatches = await Match.count({
      where: { status: "cancelled" },
    });
    const postponedMatches = await Match.count({
      where: { status: "postponed" },
    });

    const pendingDelegations = await Match.count({
      where: {
        delegationStatus: { [Op.in]: ["pending", "partial"] },
        status: { [Op.ne]: "cancelled" },
      },
    });

    return {
      total: totalMatches,
      scheduled: scheduledMatches,
      inProgress: inProgressMatches,
      completed: completedMatches,
      cancelled: cancelledMatches,
      postponed: postponedMatches,
      pendingDelegations: pendingDelegations,
    };
  }
}

module.exports = new MatchService();
