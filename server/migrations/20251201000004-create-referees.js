"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("referees", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      license_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      license_category: {
        type: Sequelize.ENUM("international", "A", "B", "C", "regional"),
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      bank_account: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add indexes
    await queryInterface.addIndex("referees", ["user_id"], {
      name: "idx_referees_user_id",
    });
    await queryInterface.addIndex("referees", ["license_category"], {
      name: "idx_referees_license_category",
    });
    await queryInterface.addIndex("referees", ["city"], {
      name: "idx_referees_city",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("referees");
  },
};
