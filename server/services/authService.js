const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Referee, sequelize } = require("../models");
const { AppError } = require("../middlewares");

class AuthService {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  }

  // Hash password
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  // Login
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Referee,
          as: "referee",
        },
      ],
    });

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    if (user.status !== "active") {
      throw new AppError(
        "Your account is not active. Please contact administrator.",
        403
      );
    }

    // Update last login time
    await user.update({ lastLoginAt: new Date() });

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  // Register user (admin creates)
  async register(userData) {
    const existingUser = await User.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists.", 400);
    }

    const passwordHash = await this.hashPassword(userData.password);

    const user = await User.create({
      ...userData,
      passwordHash,
    });

    return user;
  }

  // Register referee (User + Referee)
  async registerReferee(userData) {
    const transaction = await sequelize.transaction();

    try {
      // Check if email already exists
      const existingUser = await User.findOne({
        where: { email: userData.email },
        transaction,
      });

      if (existingUser) {
        throw new AppError("User with this email already exists.", 400);
      }

      // Check if license already exists
      const existingLicense = await Referee.findOne({
        where: { licenseNumber: userData.licenseNumber },
        transaction,
      });

      if (existingLicense) {
        throw new AppError(
          "Referee with this license number already exists.",
          400
        );
      }

      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const user = await User.create(
        {
          email: userData.email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: "referee",
          status: "active",
        },
        { transaction }
      );

      // Create referee
      const referee = await Referee.create(
        {
          userId: user.id,
          licenseNumber: userData.licenseNumber,
          licenseCategory: userData.licenseCategory,
          dateOfBirth: userData.dateOfBirth,
          city: userData.city,
          address: userData.address,
          experienceYears: userData.experienceYears || 0,
          bankAccount: userData.bankAccount,
        },
        { transaction }
      );

      await transaction.commit();

      // Return user with referee data
      const result = await User.findByPk(user.id, {
        include: [{ model: Referee, as: "referee" }],
      });

      const token = this.generateToken(result);

      return { user: result, token };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const isPasswordValid = await this.comparePassword(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect.", 400);
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    await user.update({ passwordHash: newPasswordHash });

    return { message: "Password changed successfully." };
  }

  // Get current user
  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Referee, as: "referee" }],
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }
}

module.exports = new AuthService();
