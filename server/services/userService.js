const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Referee } = require("../models");
const { AppError } = require("../middlewares");

class UserService {
  async findAll(query = {}) {
    const { page = 1, limit = 10, role, status, search } = query;
    const offset = (page - 1) * limit;

    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Referee, as: "referee" }],
      limit,
      offset,
      order: [["created_at", "DESC"]],
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
    const user = await User.findByPk(id, {
      include: [{ model: Referee, as: "referee" }],
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }

  async create(userData) {
    const existingUser = await User.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists.", 400);
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      ...userData,
      passwordHash,
    });

    return user;
  }

  async update(id, userData) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });
      if (existingUser) {
        throw new AppError("User with this email already exists.", 400);
      }
    }

    await user.update(userData);

    return user;
  }

  async delete(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await user.destroy();

    return { message: "User deleted successfully." };
  }

  async updateStatus(id, status) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await user.update({ status });

    return user;
  }

  async resetPassword(id, newPassword) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ passwordHash });

    return { message: "Password reset successfully." };
  }

  async getStatistics() {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: "active" } });
    const referees = await User.count({ where: { role: "referee" } });
    const delegates = await User.count({ where: { role: "delegate" } });
    const admins = await User.count({ where: { role: "admin" } });

    return {
      total: totalUsers,
      active: activeUsers,
      byRole: {
        referees,
        delegates,
        admins,
      },
    };
  }
}

module.exports = new UserService();
