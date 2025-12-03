"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User can be a referee (1:1)
      User.hasOne(models.Referee, {
        foreignKey: "userId",
        as: "referee",
      });

      // User (delegate) can delegate matches
      User.hasMany(models.Match, {
        foreignKey: "delegatedBy",
        as: "delegatedMatches",
      });
    }

    // Method for hiding sensitive data
    toJSON() {
      const values = { ...this.get() };
      delete values.passwordHash;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name",
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("admin", "delegate", "referee"),
        allowNull: false,
        defaultValue: "referee",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
      avatarUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "avatar_url",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return User;
};
