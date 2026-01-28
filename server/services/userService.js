const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Referee, sequelize } = require("../models");
const { AppError } = require("../middlewares");

class UserService {
  async findAll(query = {}) {
    const { page = 1, limit = 10, role, status, search } = query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

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
      limit: limitNum,
      offset,
      order: [["created_at", "DESC"]],
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

    // Use transaction to ensure both user and referee are created together
    const transaction = await sequelize.transaction();

    try {
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Extract referee-specific data
      const {
        licenseNumber,
        licenseCategory,
        dateOfBirth,
        city,
        address,
        experienceYears,
        bankAccount,
        notes,
        ...userOnlyData
      } = userData;

      const user = await User.create(
        {
          ...userOnlyData,
          passwordHash,
        },
        { transaction },
      );

      // If user is a referee, create referee profile automatically
      if (userData.role === "referee") {
        await Referee.create(
          {
            userId: user.id,
            licenseNumber: licenseNumber || `REF-${Date.now()}`, // Generate temporary if not provided
            licenseCategory: licenseCategory || "C", // Default category
            dateOfBirth: dateOfBirth || null,
            city: city || null,
            address: address || null,
            experienceYears: experienceYears || 0,
            bankAccount: bankAccount || null,
            notes: notes || null,
          },
          { transaction },
        );
      }

      await transaction.commit();

      // Return user with referee data
      return this.findById(user.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id, userData) {
    const user = await User.findByPk(id, {
      include: [{ model: Referee, as: "referee" }],
    });

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

    const transaction = await sequelize.transaction();

    try {
      // Extract referee-specific data
      const {
        licenseNumber,
        licenseCategory,
        dateOfBirth,
        city,
        address,
        experienceYears,
        bankAccount,
        notes,
        ...userOnlyData
      } = userData;

      await user.update(userOnlyData, { transaction });

      // Handle role changes
      const newRole = userData.role || user.role;
      const hadRefereeProfile = user.referee !== null;

      if (newRole === "referee") {
        if (hadRefereeProfile) {
          // Update existing referee profile
          await user.referee.update(
            {
              licenseNumber: licenseNumber || user.referee.licenseNumber,
              licenseCategory: licenseCategory || user.referee.licenseCategory,
              dateOfBirth:
                dateOfBirth !== undefined
                  ? dateOfBirth
                  : user.referee.dateOfBirth,
              city: city !== undefined ? city : user.referee.city,
              address: address !== undefined ? address : user.referee.address,
              experienceYears:
                experienceYears !== undefined
                  ? experienceYears
                  : user.referee.experienceYears,
              bankAccount:
                bankAccount !== undefined
                  ? bankAccount
                  : user.referee.bankAccount,
              notes: notes !== undefined ? notes : user.referee.notes,
            },
            { transaction },
          );
        } else {
          // Create new referee profile
          await Referee.create(
            {
              userId: user.id,
              licenseNumber: licenseNumber || `REF-${Date.now()}`,
              licenseCategory: licenseCategory || "C",
              dateOfBirth: dateOfBirth || null,
              city: city || null,
              address: address || null,
              experienceYears: experienceYears || 0,
              bankAccount: bankAccount || null,
              notes: notes || null,
            },
            { transaction },
          );
        }
      } else if (hadRefereeProfile && newRole !== "referee") {
        // Role changed from referee to something else - optionally delete referee profile
        // For now, we keep the profile but you could delete it if needed
        // await user.referee.destroy({ transaction });
      }

      await transaction.commit();

      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id) {
    const user = await User.findByPk(id, {
      include: [{ model: Referee, as: "referee" }],
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const transaction = await sequelize.transaction();

    try {
      // Delete referee profile first if exists (due to foreign key)
      if (user.referee) {
        await user.referee.destroy({ transaction });
      }

      await user.destroy({ transaction });

      await transaction.commit();

      return { message: "User deleted successfully." };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
    const inactiveUsers = await User.count({ where: { status: "inactive" } });
    const suspendedUsers = await User.count({ where: { status: "suspended" } });
    const referees = await User.count({ where: { role: "referee" } });
    const delegates = await User.count({ where: { role: "delegate" } });
    const admins = await User.count({ where: { role: "admin" } });
    const activeDelegates = await User.count({
      where: { role: "delegate", status: "active" },
    });
    const inactiveDelegates = await User.count({
      where: { role: "delegate", status: "inactive" },
    });
    const suspendedDelegates = await User.count({
      where: { role: "delegate", status: "suspended" },
    });

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      suspended: suspendedUsers,
      activeDelegates,
      inactiveDelegates,
      suspendedDelegates,
      byRole: {
        referees,
        delegates,
        admins,
      },
    };
  }
}

module.exports = new UserService();
