const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, Referee, sequelize } = require("../models");
const { AppError } = require("../middlewares");
const mailService = require("./mailService");

const PASSWORD_RESET_REQUEST_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

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
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    if (user.status !== "active") {
      throw new AppError(
        "Your account is not active. Please contact administrator.",
        403,
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

  async registerReferee(userData) {
    const transaction = await sequelize.transaction();

    try {
      const existingUser = await User.findOne({
        where: { email: userData.email },
        transaction,
      });

      if (existingUser) {
        throw new AppError("User with this email already exists.", 400);
      }

      const existingLicense = await Referee.findOne({
        where: { licenseNumber: userData.licenseNumber },
        transaction,
      });

      if (existingLicense) {
        throw new AppError(
          "Referee with this license number already exists.",
          400,
        );
      }

      const passwordHash = await this.hashPassword(userData.password);

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
        { transaction },
      );

      const referee = await Referee.create(
        {
          userId: user.id,
          licenseNumber: userData.licenseNumber,
          licenseCategory: userData.licenseCategory || "none",
          dateOfBirth: userData.dateOfBirth,
          city: userData.city,
          address: userData.address,
          experienceYears: userData.experienceYears || 0,
          bankAccount: userData.bankAccount,
        },
        { transaction },
      );

      await transaction.commit();

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

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const isPasswordValid = await this.comparePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect.", 400);
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    await user.update({
      passwordHash: newPasswordHash,
      mustChangePassword: false,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

    const updatedUser = await this.getCurrentUser(userId);

    return {
      message: "Password changed successfully.",
      user: updatedUser,
    };
  }

  hashPasswordResetToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  getPasswordResetExpiry() {
    const hours = Number(process.env.PASSWORD_RESET_TOKEN_TTL_HOURS || 168);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });

    if (!user || user.status !== "active") {
      return { message: PASSWORD_RESET_REQUEST_MESSAGE };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await user.update({
      passwordResetTokenHash: this.hashPasswordResetToken(resetToken),
      passwordResetExpiresAt: this.getPasswordResetExpiry(),
    });

    try {
      await mailService.sendPasswordResetEmail({ user, resetToken });
    } catch (error) {
      console.error("Password reset email delivery failed:", error);
    }

    return { message: PASSWORD_RESET_REQUEST_MESSAGE };
  }

  async resetPasswordWithToken(token, newPassword) {
    const tokenHash = this.hashPasswordResetToken(token);

    const user = await User.findOne({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new AppError("Password reset link is invalid or expired.", 400);
    }

    const passwordHash = await this.hashPassword(newPassword);

    await user.update({
      passwordHash,
      mustChangePassword: false,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

    return { message: "Password has been updated successfully." };
  }

  async verifyPassword(userId, password) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError("Incorrect password.", 400);
    }

    return { success: true };
  }

  async updateCurrentUser(userId, data) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await user.update({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
    });

    return this.getCurrentUser(userId);
  }

  async deleteAccount(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await user.destroy();

    return { message: "Account deleted successfully." };
  }

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
