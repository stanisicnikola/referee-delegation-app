const { Op } = require("sequelize");
const {
  User,
  Match,
  MatchReferee,
  Referee,
  Team,
  Competition,
  Venue,
  sequelize,
} = require("../models");
const { WEEKDAY_SHORT_NAMES } = require("../constants/date");
const { getRefereeCategoryLabel } = require("../constants/refereeCategories");

class DashboardService {
  /**
   * Get aggregated dashboard data
   * @param {string} period - '7days', '30days', or 'season'
   */
  async getDashboardData(period = "7days") {
    const [stats, chartData, recentActivity, upcomingMatches] =
      await Promise.all([
        this._getStats(),
        this._getChartData(period),
        this._getRecentActivity(),
        this._getUpcomingMatches(),
      ]);

    return {
      stats,
      chartData,
      recentActivity,
      upcomingMatches,
    };
  }

  async _getStats() {
    const [
      totalUsers,
      activeReferees,
      totalMatches,
      matchesWithDelegation,
      pendingDelegations,
      refereesCount,
      delegatesCount,
      adminsCount,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: "referee", status: "active" } }),
      Match.count(),
      Match.count({
        where: {
          delegationStatus: { [Op.in]: ["complete", "confirmed"] },
          status: { [Op.ne]: "cancelled" },
        },
      }),
      Match.count({
        where: {
          delegationStatus: { [Op.in]: ["pending", "partial"] },
          scheduledAt: { [Op.gte]: new Date() },
          status: { [Op.ne]: "cancelled" },
        },
      }),
      User.count({ where: { role: "referee" } }),
      User.count({ where: { role: "delegate" } }),
      User.count({ where: { role: "admin" } }),
    ]);

    const delegationRate =
      totalMatches > 0
        ? Math.round((matchesWithDelegation / totalMatches) * 100)
        : 0;

    return {
      totalUsers,
      activeReferees,
      totalMatches,
      delegationRate,
      pendingDelegations,
      distribution: {
        referees: refereesCount,
        delegates: delegatesCount,
        admins: adminsCount,
      },
    };
  }

  async _getChartData(period) {
    let startDate, endDate;
    const now = new Date();

    if (period === "thisMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
    } else if (period === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);
    }

    const matches = await Match.findAll({
      where: {
        scheduledAt: { [Op.between]: [startDate, endDate] },
      },
      attributes: ["scheduledAt", "delegationStatus", "status"],
      raw: true,
    });

    const dayMap = {};
    const isMonthView = period === "thisMonth" || period === "lastMonth";
    const current = new Date(startDate);

    while (current <= endDate) {
      const key = this._toLocalDateKey(current);
      dayMap[key] = {
        day: isMonthView
          ? String(current.getDate())
          : WEEKDAY_SHORT_NAMES[current.getDay()],
        date: key,
        matches: 0,
        pending: 0,
      };
      current.setDate(current.getDate() + 1);
    }

    for (const match of matches) {
      const key = this._toLocalDateKey(new Date(match.scheduledAt));
      if (dayMap[key]) {
        dayMap[key].matches += 1;
        if (
          match.status !== "cancelled" &&
          (match.delegationStatus === "pending" ||
            match.delegationStatus === "partial")
        ) {
          dayMap[key].pending += 1;
        }
      }
    }

    return Object.values(dayMap);
  }

  async _getRecentActivity() {
    const [recentMatches, recentUsers] = await Promise.all([
      Match.findAll({
        order: [["created_at", "DESC"]],
        limit: 5,
        include: [
          { model: Team, as: "homeTeam", attributes: ["name"] },
          { model: Team, as: "awayTeam", attributes: ["name"] },
          {
            model: User,
            as: "delegate",
            attributes: ["firstName", "lastName"],
          },
        ],
      }),
      User.findAll({
        order: [["created_at", "DESC"]],
        limit: 5,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "role",
          "created_at",
          "lastLoginAt",
        ],
        include: [
          {
            model: Referee,
            as: "referee",
            attributes: ["licenseCategory"],
            required: false,
          },
        ],
      }),
    ]);

    const activities = [];

    for (const match of recentMatches) {
      const homeTeamName = match.homeTeam?.name || "Unknown";
      const awayTeamName = match.awayTeam?.name || "Unknown";

      if (match.delegatedBy && match.delegatedAt) {
        activities.push({
          id: `delegation-${match.id}`,
          type: "delegation",
          title: "Delegation created",
          description: `${homeTeamName} vs ${awayTeamName}`,
          time: match.delegatedAt,
          rawTime: new Date(match.delegatedAt),
        });
      }

      activities.push({
        id: `match-${match.id}`,
        type: "match",
        title: "Match created",
        description: `${homeTeamName} vs ${awayTeamName}`,
        time: match.created_at,
        rawTime: new Date(match.created_at),
      });
    }

    for (const user of recentUsers) {
      activities.push({
        id: `user-${user.id}`,
        type: "user",
        title: "New user added",
        description: `${user.firstName} ${user.lastName} (${user.role}${
          user.referee?.licenseCategory
            ? ` - Category: ${getRefereeCategoryLabel(
                user.referee.licenseCategory,
              )}`
            : ""
        })`,
        time: user.created_at,
        rawTime: new Date(user.created_at),
      });

      if (user.lastLoginAt) {
        activities.push({
          id: `login-${user.id}`,
          type: "login",
          title: "User logged in",
          description: `${user.firstName} ${user.lastName}`,
          time: user.lastLoginAt,
          rawTime: new Date(user.lastLoginAt),
        });
      }
    }

    activities.sort((a, b) => b.rawTime - a.rawTime);

    return activities.slice(0, 8).map(({ rawTime, ...rest }) => ({
      ...rest,
      time: this._formatRelativeTime(rawTime),
    }));
  }

  async _getUpcomingMatches() {
    const matches = await Match.findAll({
      where: {
        scheduledAt: { [Op.gte]: new Date() },
        status: "scheduled",
      },
      include: [
        { model: Team, as: "homeTeam", attributes: ["name", "logoUrl"] },
        { model: Team, as: "awayTeam", attributes: ["name", "logoUrl"] },
        { model: Competition, as: "competition", attributes: ["name"] },
        { model: Venue, as: "venue", attributes: ["name"] },
      ],
      order: [["scheduledAt", "ASC"]],
      limit: 5,
    });

    return matches;
  }

  _toLocalDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  _formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `Before ${diffMins} min`;
    if (diffHours < 24) return `Before ${diffHours}h`;
    if (diffDays < 7) return `Before ${diffDays}d`;
    return date.toLocaleDateString("bs-BA");
  }
}

module.exports = new DashboardService();
