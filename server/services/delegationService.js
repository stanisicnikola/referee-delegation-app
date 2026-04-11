const { Op } = require("sequelize");
const {
  Match,
  MatchReferee,
  Referee,
  RefereeAvailability,
  User,
  Team,
  Venue,
  Competition,
  sequelize,
} = require("../models");
const { AppError } = require("../middlewares");

class DelegationService {
  /**
   * Delegate referees to a match
   * @param {string} matchId - Match ID
   * @param {object} delegationData - Delegation data
   * @param {string} delegateId - ID of the delegate performing the delegation
   */
  async delegateReferees(matchId, delegationData, delegateId) {
    const { refereeAssignments } = delegationData;

    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    if (match.status === "completed" || match.status === "cancelled") {
      throw new AppError(
        "Cannot delegate referees to a completed or cancelled match.",
        400
      );
    }

    const transaction = await sequelize.transaction();

    try {
      // Delete existing delegations for this match
      await MatchReferee.destroy({ where: { matchId }, transaction });

      // Create new delegations
      const assignments = [];
      for (const assignment of refereeAssignments) {
        const referee = await Referee.findByPk(assignment.refereeId);
        if (!referee) {
          throw new AppError(
            `Referee with ID ${assignment.refereeId} not found.`,
            400
          );
        }

        // Check if referee is available on that date
        const matchDate = match.scheduledAt.toISOString().split("T")[0];
        const availability = await RefereeAvailability.findOne({
          where: {
            refereeId: assignment.refereeId,
            date: matchDate,
            isAvailable: false,
          },
          transaction,
        });

        if (availability) {
          throw new AppError(
            `Referee ${referee.id} is not available on the match date.`,
            400
          );
        }

        // Check if referee already has a match on that day
        const existingAssignment = await MatchReferee.findOne({
          include: [
            {
              model: Match,
              as: "match",
              where: {
                id: { [Op.ne]: matchId },
                scheduledAt: {
                  [Op.gte]: new Date(matchDate),
                  [Op.lt]: new Date(
                    new Date(matchDate).getTime() + 24 * 60 * 60 * 1000
                  ),
                },
              },
            },
          ],
          where: { refereeId: assignment.refereeId },
          transaction,
        });

        if (existingAssignment) {
          throw new AppError(
            `Referee already has a match on ${matchDate}.`,
            400
          );
        }

        assignments.push({
          matchId,
          refereeId: assignment.refereeId,
          role: assignment.role,
        });
      }

      await MatchReferee.bulkCreate(assignments, { transaction });

      // Update delegation status and delegate on match
      const delegationStatus = assignments.length >= 3 ? "complete" : "partial";
      await match.update(
        { delegationStatus, delegatedBy: delegateId, delegatedAt: new Date() },
        { transaction }
      );

      await transaction.commit();

      return this.getMatchDelegation(matchId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get delegation for a match
   * @param {string} matchId - Match ID
   */
  async getMatchDelegation(matchId) {
    const match = await Match.findByPk(matchId, {
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

  /**
   * Remove referee from match
   * @param {string} matchId - Match ID
   * @param {string} refereeId - Referee ID
   */
  async removeRefereeFromMatch(matchId, refereeId) {
    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Referee is not delegated to this match.", 404);
    }

    await assignment.destroy();

    // Update delegation status
    const remainingAssignments = await MatchReferee.count({
      where: { matchId },
    });
    let delegationStatus = "pending";
    if (remainingAssignments > 0 && remainingAssignments < 3) {
      delegationStatus = "partial";
    } else if (remainingAssignments >= 3) {
      delegationStatus = "complete";
    }

    await match.update({ delegationStatus });

    return this.getMatchDelegation(matchId);
  }

  /**
   * Get available referees for a match
   * @param {string} matchId - Match ID
   */
  async getAvailableRefereesForMatch(matchId) {
    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    const matchDate = match.scheduledAt.toISOString().split("T")[0];

    // Get referees who are unavailable on that date
    const unavailableReferees = await RefereeAvailability.findAll({
      where: { date: matchDate, isAvailable: false },
      attributes: ["refereeId"],
    });

    const unavailableRefereeIds = unavailableReferees.map((a) => a.refereeId);

    // Get referees who already have a match on that date
    const busyReferees = await MatchReferee.findAll({
      include: [
        {
          model: Match,
          as: "match",
          where: {
            id: { [Op.ne]: matchId },
            scheduledAt: {
              [Op.gte]: new Date(matchDate),
              [Op.lt]: new Date(
                new Date(matchDate).getTime() + 24 * 60 * 60 * 1000
              ),
            },
          },
        },
      ],
      attributes: ["refereeId"],
    });

    const busyRefereeIds = busyReferees.map((a) => a.refereeId);

    // Get all active referees who are not unavailable and not busy
    const excludeIds = [
      ...new Set([...unavailableRefereeIds, ...busyRefereeIds]),
    ];

    const whereClause = {};
    if (excludeIds.length > 0) {
      whereClause.id = { [Op.notIn]: excludeIds };
    }

    const availableReferees = await Referee.findAll({
      where: whereClause,
      include: [{ model: User, as: "user", where: { status: "active" } }],
      order: [[{ model: User, as: "user" }, "lastName", "ASC"]],
    });

    return availableReferees;
  }

  /**
   * Update referee role on a match
   * @param {string} matchId - Match ID
   * @param {string} refereeId - Referee ID
   * @param {string} role - New role
   */
  async updateRefereeRole(matchId, refereeId, role) {
    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Referee is not delegated to this match.", 404);
    }

    await assignment.update({ role });

    return this.getMatchDelegation(matchId);
  }

  /**
   * Get delegations by delegate
   * @param {string} delegateId - Delegate ID
   * @param {object} query - Query parameters
   */
  async getDelegationsByDelegate(delegateId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;

    const where = { delegatedBy: delegateId };
    if (status) where.delegationStatus = status;

    const { count, rows } = await Match.findAndCountAll({
      where,
      include: [
        { model: Competition, as: "competition" },
        { model: Team, as: "homeTeam" },
        { model: Team, as: "awayTeam" },
        { model: Venue, as: "venue" },
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
      limit,
      offset,
      order: [["scheduledAt", "DESC"]],
      distinct: true,
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
   * Get delegation statistics
   */
  async getDelegationStatistics() {
    const total = await Match.count();
    const pending = await Match.count({
      where: { delegationStatus: "pending" },
    });
    const partial = await Match.count({
      where: { delegationStatus: "partial" },
    });
    const complete = await Match.count({
      where: { delegationStatus: "complete" },
    });
    const confirmed = await Match.count({
      where: { delegationStatus: "confirmed" },
    });

    // Matches awaiting delegation in the next 7 days
    const upcomingPending = await Match.count({
      where: {
        delegationStatus: { [Op.in]: ["pending", "partial"] },
        scheduledAt: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      total,
      pending,
      partial,
      complete,
      confirmed,
      upcomingPending,
    };
  }

  /**
   * Get delegate dashboard data
   * KPI rule: count only future matches (scheduledAt >= now)
   */
  async getDelegateDashboard() {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Summary counts for future matches only
    const [
      pendingDelegations,
      upcomingMatchesCount,
      activeReferees,
      confirmedDelegations,
      notificationCount,
    ] = await Promise.all([
      Match.count({
        where: {
          delegationStatus: "pending",
          scheduledAt: { [Op.gte]: now },
        },
      }),
      Match.count({
        where: {
          scheduledAt: { [Op.gte]: now },
        },
      }),
      Referee.count({
        include: [{ model: User, as: "user", where: { status: "active" } }],
      }),
      Match.count({
        where: {
          delegationStatus: "confirmed",
          scheduledAt: { [Op.gte]: now },
        },
      }),
      // Notifications: matches awaiting delegation in next 7 days
      Match.count({
        where: {
          delegationStatus: { [Op.in]: ["pending", "partial"] },
          scheduledAt: {
            [Op.gte]: now,
            [Op.lte]: next7Days,
          },
        },
      }),
    ]);

    // Upcoming matches (max 4, sorted by scheduledAt ASC)
    const upcomingMatches = await Match.findAll({
      where: {
        scheduledAt: { [Op.gte]: now },
      },
      include: [
        { model: Team, as: "homeTeam", attributes: ["name", "logoUrl"] },
        { model: Team, as: "awayTeam", attributes: ["name", "logoUrl"] },
        { model: Competition, as: "competition", attributes: ["name"] },
        { model: Venue, as: "venue", attributes: ["name", "city"] },
      ],
      order: [["scheduledAt", "ASC"]],
      limit: 4,
    });

    // Availability for next 7 days (daily counts + sample referees)
    const availabilityData = await this._getDelegateAvailabilityData(now, next7Days);

    return {
      summary: {
        pendingDelegations,
        upcomingMatchesCount,
        activeReferees,
        confirmedDelegations,
        notificationCount,
      },
      upcomingMatches,
      availability: availabilityData,
    };
  }

  /**
   * Helper: get delegate availability data for next 7 days
   * Returns array of 7 days with counts and sample referees
   */
  async _getDelegateAvailabilityData(startDate, endDate) {
    const result = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const dateKey = current.toISOString().split("T")[0];
      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);

      // Count referees explicitly unavailable
      const unavailableCount = await RefereeAvailability.count({
        where: {
          date: dateKey,
          isAvailable: false,
        },
      });

      // Count referees already assigned to matches on this day
      const assignedCount = await MatchReferee.count({
        distinct: true,
        col: "referee_id",
        include: [
          {
            model: Match,
            as: "match",
            where: {
              scheduledAt: {
                [Op.gte]: current,
                [Op.lt]: nextDay,
              },
            },
          },
        ],
      });

      // Total active referees
      const totalActive = await Referee.count({
        include: [{ model: User, as: "user", where: { status: "active" } }],
      });

      const availableCount = Math.max(0, totalActive - unavailableCount - assignedCount);

      // Get sample available referees (max 3)
      const unavailableIds = await RefereeAvailability.findAll({
        where: { date: dateKey, isAvailable: false },
        attributes: ["refereeId"],
        raw: true,
      });

      const assignedIds = await MatchReferee.findAll({
        include: [
          {
            model: Match,
            as: "match",
            where: {
              scheduledAt: {
                [Op.gte]: current,
                [Op.lt]: nextDay,
              },
            },
          },
        ],
        attributes: ["refereeId"],
        raw: true,
      });

      const excludeIds = [
        ...new Set([
          ...unavailableIds.map((r) => r.refereeId),
          ...assignedIds.map((r) => r.refereeId),
        ]),
      ];

      const whereClause = {};
      if (excludeIds.length > 0) {
        whereClause.id = { [Op.notIn]: excludeIds };
      }

      const sampleReferees = await Referee.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            where: { status: "active" },
            attributes: ["firstName", "lastName"],
          },
        ],
        limit: 3,
        order: [[{ model: User, as: "user" }, "lastName", "ASC"]],
      });

      result.push({
        date: dateKey,
        availableCount,
        unavailableCount,
        assignedCount,
        referees: sampleReferees.map((r) => ({
          id: r.id,
          name: `${r.user.firstName} ${r.user.lastName}`,
          licenseCategory: r.licenseCategory,
        })),
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  /**
   * Confirm referee assignment (referee confirms availability)
   * @param {string} matchId - Match ID
   * @param {string} refereeId - Referee ID
   */
  async confirmAssignment(matchId, refereeId) {
    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Delegation not found.", 404);
    }

    await assignment.update({ status: "accepted", responseAt: new Date() });

    // Check if all referees confirmed - update match status
    const match = await Match.findByPk(matchId);
    const allAssignments = await MatchReferee.findAll({ where: { matchId } });
    const allAccepted = allAssignments.every((a) => a.status === "accepted");

    if (allAccepted && match.delegationStatus === "complete") {
      await match.update({ delegationStatus: "confirmed" });
    }

    return this.getMatchDelegation(matchId);
  }

  /**
   * Reject referee assignment
   * @param {string} matchId - Match ID
   * @param {string} refereeId - Referee ID
   * @param {string} reason - Rejection reason
   */
  async rejectAssignment(matchId, refereeId, reason) {
    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Delegation not found.", 404);
    }

    await assignment.update({
      status: "declined",
      responseAt: new Date(),
      declineReason: reason,
    });

    // Update delegation status to "partial"
    const match = await Match.findByPk(matchId);
    if (
      match &&
      (match.delegationStatus === "complete" ||
        match.delegationStatus === "confirmed")
    ) {
      await match.update({ delegationStatus: "partial" });
    }

    return this.getMatchDelegation(matchId);
  }
}

module.exports = new DelegationService();
