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

const ACTIVE_ASSIGNMENT_STATUSES = ["pending", "accepted"];
const CLOSED_MATCH_STATUSES = ["completed", "cancelled"];
const BLOCKING_AVAILABILITY_STATUSES = ["approved"];

class DelegationService {
  toLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getDelegateMatchScope(actor) {
    return actor?.role === "delegate" ? { delegatedBy: actor.id } : {};
  }

  isMatchStarted(match) {
    return match.scheduledAt && new Date(match.scheduledAt) <= new Date();
  }

  getRoundNumber(round) {
    if (round === null || round === undefined || round === "") return null;
    if (typeof round === "number" && Number.isFinite(round)) return round;

    const matches = String(round).match(/\d+/g);
    if (!matches?.length) return null;

    const roundNumber = Number.parseInt(matches[matches.length - 1], 10);
    return Number.isFinite(roundNumber) ? roundNumber : null;
  }

  getMatchTeams(match) {
    return [
      {
        id: match.homeTeamId,
        name: match.homeTeam?.name || "home team",
      },
      {
        id: match.awayTeamId,
        name: match.awayTeam?.name || "away team",
      },
    ].filter((team, index, teams) => {
      return team.id && teams.findIndex((item) => item.id === team.id) === index;
    });
  }

  getRefereeDisplayName(referee) {
    const firstName = referee?.user?.firstName || "";
    const lastName = referee?.user?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "Referee";
  }

  async getConsecutiveTeamAssignmentViolations(match, refereeIds, options = {}) {
    const currentRound = this.getRoundNumber(match.round);
    if (!currentRound || currentRound <= 3 || refereeIds.length === 0) {
      return new Map();
    }

    const previousRounds = [currentRound - 1, currentRound - 2, currentRound - 3];
    if (previousRounds.some((round) => round < 1)) return new Map();

    const teams = this.getMatchTeams(match);
    if (teams.length === 0) return new Map();

    const previousAssignments = await MatchReferee.findAll({
      where: {
        refereeId: { [Op.in]: refereeIds },
        status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES },
      },
      include: [
        {
          model: Match,
          as: "match",
          required: true,
          attributes: [
            "id",
            "competitionId",
            "homeTeamId",
            "awayTeamId",
            "round",
            "status",
          ],
          where: {
            id: { [Op.ne]: match.id },
            competitionId: match.competitionId,
            status: { [Op.ne]: "cancelled" },
            [Op.or]: [
              { homeTeamId: { [Op.in]: teams.map((team) => team.id) } },
              { awayTeamId: { [Op.in]: teams.map((team) => team.id) } },
            ],
          },
        },
      ],
      transaction: options.transaction,
    });

    const roundsByRefereeAndTeam = new Map();

    for (const assignment of previousAssignments) {
      const previousMatch = assignment.match;
      const previousRound = this.getRoundNumber(previousMatch?.round);
      if (!previousRounds.includes(previousRound)) continue;

      for (const team of teams) {
        const involved =
          previousMatch.homeTeamId === team.id || previousMatch.awayTeamId === team.id;
        if (!involved) continue;

        const key = `${assignment.refereeId}:${team.id}`;
        const rounds = roundsByRefereeAndTeam.get(key) || new Set();
        rounds.add(previousRound);
        roundsByRefereeAndTeam.set(key, rounds);
      }
    }

    const violations = new Map();

    for (const refereeId of refereeIds) {
      for (const team of teams) {
        const key = `${refereeId}:${team.id}`;
        const rounds = roundsByRefereeAndTeam.get(key);
        const hasThreeConsecutivePreviousRounds =
          rounds && previousRounds.every((round) => rounds.has(round));

        if (!hasThreeConsecutivePreviousRounds) continue;

        const refereeViolations = violations.get(refereeId) || [];
        refereeViolations.push({
          teamId: team.id,
          teamName: team.name,
          rounds: [...previousRounds].sort((a, b) => a - b),
        });
        violations.set(refereeId, refereeViolations);
      }
    }

    return violations;
  }

  assertNoConsecutiveTeamAssignmentViolation(referee, violations) {
    if (!violations?.length) return;

    const violation = violations[0];
    throw new AppError(
      `${this.getRefereeDisplayName(referee)} cannot be assigned to this match because they already officiated ${violation.teamName} in rounds ${violation.rounds.join(", ")} of this competition.`,
      400
    );
  }

  assertMatchCanBeChanged(match) {
    if (CLOSED_MATCH_STATUSES.includes(match.status)) {
      throw new AppError(
        "Cannot change referee assignments for a completed or cancelled match.",
        400
      );
    }

    if (this.isMatchStarted(match)) {
      throw new AppError(
        "Cannot change referee assignments after the match has started.",
        400
      );
    }

    if (match.delegationStatus === "confirmed") {
      throw new AppError(
        "This match delegation is already confirmed by all referees.",
        400
      );
    }
  }

  getDelegationStatus(assignments) {
    const activeAssignments = assignments.filter((assignment) =>
      ACTIVE_ASSIGNMENT_STATUSES.includes(assignment.status)
    );

    if (activeAssignments.length === 0) return "pending";
    if (activeAssignments.length < 3) return "partial";

    return activeAssignments.every((a) => a.status === "accepted")
      ? "confirmed"
      : "complete";
  }

  /**
   * Delegate referees to a match
   * @param {string} matchId - Match ID
   * @param {object} delegationData - Delegation data
   * @param {string} delegateId - ID of the delegate performing the delegation
   */
  async delegateReferees(matchId, delegationData, delegateId) {
    const { refereeAssignments = [] } = delegationData;

    const match = await Match.findByPk(matchId, {
      include: [
        { model: Team, as: "homeTeam", attributes: ["id", "name"] },
        { model: Team, as: "awayTeam", attributes: ["id", "name"] },
      ],
    });
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    this.assertMatchCanBeChanged(match);

    if (!Array.isArray(refereeAssignments) || refereeAssignments.length > 3) {
      throw new AppError("A match can have at most three referees.", 400);
    }

    const refereeIds = refereeAssignments.map((a) => a.refereeId);
    const roles = refereeAssignments.map((a) => a.role);

    if (new Set(refereeIds).size !== refereeIds.length) {
      throw new AppError("The same referee cannot be assigned twice.", 400);
    }

    if (new Set(roles).size !== roles.length) {
      throw new AppError("Each referee role can only be used once.", 400);
    }

    const transaction = await sequelize.transaction();

    try {
      const existingAssignments = await MatchReferee.findAll({
        where: { matchId },
        transaction,
      });
      const activeExistingAssignments = existingAssignments.filter(
        (assignment) => ACTIVE_ASSIGNMENT_STATUSES.includes(assignment.status)
      );

      if (activeExistingAssignments.length >= 3) {
        const allAccepted = activeExistingAssignments.every(
          (assignment) => assignment.status === "accepted"
        );
        throw new AppError(
          allAccepted
            ? "All referees have confirmed this match."
            : "A full referee crew is already assigned. Wait for confirmations or a rejection before changing it.",
          400
        );
      }

      const requestedByRefereeId = new Map(
        refereeAssignments.map((assignment) => [
          assignment.refereeId,
          assignment,
        ])
      );
      const declinedAssignmentByRefereeId = new Map(
        existingAssignments
          .filter((assignment) => assignment.status === "declined")
          .map((assignment) => [assignment.refereeId, assignment])
      );
      const consecutiveTeamViolations =
        await this.getConsecutiveTeamAssignmentViolations(match, refereeIds, {
          transaction,
        });

      for (const assignment of refereeAssignments) {
        const declinedAssignment = declinedAssignmentByRefereeId.get(
          assignment.refereeId
        );
        if (declinedAssignment) {
          throw new AppError(
            "This referee already declined this match and cannot be assigned again.",
            400
          );
        }
      }

      for (const assignment of activeExistingAssignments) {
        const requested = requestedByRefereeId.get(assignment.refereeId);
        if (
          assignment.status === "accepted" &&
          (!requested || requested.role !== assignment.role)
        ) {
          throw new AppError(
            "Accepted referee assignments cannot be removed or changed.",
            400
          );
        }
      }

      for (const assignment of refereeAssignments) {
        const existingAssignment = activeExistingAssignments.find(
          (item) => item.refereeId === assignment.refereeId
        );

        if (existingAssignment) {
          if (existingAssignment.role !== assignment.role) {
            await existingAssignment.update(
              { role: assignment.role },
              { transaction }
            );
          }
          continue;
        }

        const referee = await Referee.findByPk(assignment.refereeId, {
          include: [{ model: User, as: "user" }],
          transaction,
        });
        if (!referee) {
          throw new AppError(
            `Referee with ID ${assignment.refereeId} not found.`,
            400
          );
        }

        this.assertNoConsecutiveTeamAssignmentViolation(
          referee,
          consecutiveTeamViolations.get(assignment.refereeId)
        );

        // Check if referee is available on that date
        const matchDate = match.scheduledAt.toISOString().split("T")[0];
        const availability = await RefereeAvailability.findOne({
          where: {
            refereeId: assignment.refereeId,
            date: matchDate,
            isAvailable: false,
            approvalStatus: { [Op.in]: BLOCKING_AVAILABILITY_STATUSES },
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
        const conflictingAssignment = await MatchReferee.findOne({
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
          where: {
            refereeId: assignment.refereeId,
            status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES },
          },
          transaction,
        });

        if (conflictingAssignment) {
          throw new AppError(
            `Referee already has a match on ${matchDate}.`,
            400
          );
        }

        await MatchReferee.create(
          {
            matchId,
            refereeId: assignment.refereeId,
            role: assignment.role,
          },
          { transaction }
        );
      }

      const requestedRefereeIdSet = new Set(refereeIds);
      const removableAssignments = activeExistingAssignments.filter(
        (assignment) =>
          assignment.status !== "accepted" &&
          !requestedRefereeIdSet.has(assignment.refereeId)
      );

      if (removableAssignments.length > 0) {
        await MatchReferee.destroy({
          where: { id: removableAssignments.map((assignment) => assignment.id) },
          transaction,
        });
      }

      const finalAssignments = await MatchReferee.findAll({
        where: { matchId },
        transaction,
      });

      // Update delegation status and delegate on match
      const delegationStatus = this.getDelegationStatus(finalAssignments);
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

    this.assertMatchCanBeChanged(match);

    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Referee is not delegated to this match.", 404);
    }

    if (assignment.status === "accepted") {
      throw new AppError("Accepted referee assignments cannot be removed.", 400);
    }

    await assignment.destroy();

    // Update delegation status
    const remainingAssignments = await MatchReferee.findAll({
      where: { matchId },
    });
    const delegationStatus = this.getDelegationStatus(remainingAssignments);

    await match.update({ delegationStatus });

    return this.getMatchDelegation(matchId);
  }

  /**
   * Get available referees for a match
   * @param {string} matchId - Match ID
   */
  async getAvailableRefereesForMatch(matchId) {
    const match = await Match.findByPk(matchId, {
      include: [
        { model: Team, as: "homeTeam", attributes: ["id", "name"] },
        { model: Team, as: "awayTeam", attributes: ["id", "name"] },
      ],
    });
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    if (CLOSED_MATCH_STATUSES.includes(match.status)) {
      return [];
    }

    const matchDate = match.scheduledAt.toISOString().split("T")[0];

    // Get referees who are unavailable on that date
    const unavailableReferees = await RefereeAvailability.findAll({
      where: {
        date: matchDate,
        isAvailable: false,
        approvalStatus: { [Op.in]: BLOCKING_AVAILABILITY_STATUSES },
      },
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
      where: { status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES } },
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

    const consecutiveTeamViolations =
      await this.getConsecutiveTeamAssignmentViolations(
        match,
        availableReferees.map((referee) => referee.id)
      );

    return availableReferees.filter(
      (referee) => !consecutiveTeamViolations.has(referee.id)
    );
  }

  /**
   * Update referee role on a match
   * @param {string} matchId - Match ID
   * @param {string} refereeId - Referee ID
   * @param {string} role - New role
   */
  async updateRefereeRole(matchId, refereeId, role) {
    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    this.assertMatchCanBeChanged(match);

    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Referee is not delegated to this match.", 404);
    }

    if (assignment.status === "accepted") {
      throw new AppError("Accepted referee assignments cannot be changed.", 400);
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
      where: { delegationStatus: "pending", status: { [Op.ne]: "cancelled" } },
    });
    const partial = await Match.count({
      where: { delegationStatus: "partial", status: { [Op.ne]: "cancelled" } },
    });
    const complete = await Match.count({
      where: { delegationStatus: "complete", status: { [Op.ne]: "cancelled" } },
    });
    const confirmed = await Match.count({
      where: {
        delegationStatus: "confirmed",
        status: { [Op.ne]: "cancelled" },
      },
    });

    // Matches awaiting delegation in the next 7 days
    const upcomingPending = await Match.count({
      where: {
        delegationStatus: { [Op.in]: ["pending", "partial"] },
        status: { [Op.ne]: "cancelled" },
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
  async getDelegateDashboard(actor = null) {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const matchScope = this.getDelegateMatchScope(actor);

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
          ...matchScope,
          delegationStatus: "pending",
          status: { [Op.ne]: "cancelled" },
        },
      }),
      Match.count({
        where: {
          ...matchScope,
          scheduledAt: { [Op.gte]: now },
          status: { [Op.ne]: "cancelled" },
        },
      }),
      Referee.count({
        include: [{ model: User, as: "user", where: { status: "active" } }],
      }),
      Match.count({
        where: {
          ...matchScope,
          delegationStatus: "confirmed",
          status: { [Op.ne]: "cancelled" },
        },
      }),
      // Notifications: matches awaiting delegation in next 7 days
      Match.count({
        where: {
          ...matchScope,
          delegationStatus: { [Op.in]: ["pending", "partial"] },
          status: { [Op.ne]: "cancelled" },
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
        ...matchScope,
        scheduledAt: { [Op.gte]: now },
        status: { [Op.ne]: "cancelled" },
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
      const dateKey = this.toLocalDateKey(current);
      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);

      // Total active referees
      const totalActive = await Referee.count({
        include: [{ model: User, as: "user", where: { status: "active" } }],
      });

      const unavailableIds = await RefereeAvailability.findAll({
        where: { date: dateKey, isAvailable: false, approvalStatus: "approved" },
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
        where: { status: { [Op.in]: ACTIVE_ASSIGNMENT_STATUSES } },
        attributes: ["refereeId"],
        raw: true,
      });

      const unavailableRefereeIds = [
        ...new Set(unavailableIds.map((r) => r.refereeId)),
      ];
      const assignedRefereeIds = [
        ...new Set(assignedIds.map((r) => r.refereeId)),
      ];
      const excludeIds = [
        ...new Set([
          ...unavailableRefereeIds,
          ...assignedRefereeIds,
        ]),
      ];
      const availableCount = Math.max(0, totalActive - excludeIds.length);

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
        unavailableCount: unavailableRefereeIds.length,
        assignedCount: assignedRefereeIds.length,
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

    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    if (match.status === "cancelled") {
      throw new AppError("Cannot accept a cancelled match assignment.", 400);
    }

    if (assignment.status === "declined") {
      throw new AppError("Declined assignments cannot be accepted.", 400);
    }

    if (assignment.status === "cancelled") {
      throw new AppError("Cancelled assignments cannot be accepted.", 400);
    }

    await assignment.update({ status: "accepted", responseAt: new Date() });

    // Check if all referees confirmed - update match status
    const allAssignments = await MatchReferee.findAll({ where: { matchId } });
    const delegationStatus = this.getDelegationStatus(allAssignments);
    await match.update({ delegationStatus });

    return this.getMatchDelegation(matchId);
  }

  /**
   * Reject referee assignment
   * @param {string} matchId - Match ID
   * @param {string} refereeId - Referee ID
   * @param {string} reason - Rejection reason
   * @param {string} notes - Optional rejection notes
   */
  async rejectAssignment(matchId, refereeId, reason, notes = null) {
    const assignment = await MatchReferee.findOne({
      where: { matchId, refereeId },
    });

    if (!assignment) {
      throw new AppError("Delegation not found.", 404);
    }

    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new AppError("Match not found.", 404);
    }

    if (match.status === "cancelled") {
      throw new AppError("Cannot reject a cancelled match assignment.", 400);
    }

    if (match.delegationStatus === "confirmed") {
      throw new AppError("This match delegation is already confirmed.", 400);
    }

    if (assignment.status === "accepted") {
      throw new AppError("Accepted assignments cannot be rejected.", 400);
    }

    if (assignment.status === "cancelled") {
      throw new AppError("Cancelled assignments cannot be rejected.", 400);
    }

    await assignment.update({
      status: "declined",
      responseAt: new Date(),
      declineReason: reason || null,
      notes: notes?.trim() || null,
    });

    const remainingAssignments = await MatchReferee.findAll({
      where: { matchId },
    });
    const delegationStatus = this.getDelegationStatus(remainingAssignments);
    await match.update({ delegationStatus });

    return this.getMatchDelegation(matchId);
  }
}

module.exports = new DelegationService();
