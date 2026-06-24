"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("referee_availability", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "reason",
    });

    await queryInterface.addColumn("referee_availability", "approval_status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "approved",
      after: "description",
    });

    await queryInterface.addColumn("referee_availability", "reviewed_by", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      after: "approval_status",
    });

    await queryInterface.addColumn("referee_availability", "reviewed_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "reviewed_by",
    });

    await queryInterface.addIndex("referee_availability", ["approval_status"], {
      name: "idx_referee_availability_approval_status",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "referee_availability",
      "idx_referee_availability_approval_status",
    );
    await queryInterface.removeColumn("referee_availability", "reviewed_at");
    await queryInterface.removeColumn("referee_availability", "reviewed_by");
    await queryInterface.removeColumn(
      "referee_availability",
      "approval_status",
    );
    await queryInterface.removeColumn("referee_availability", "description");
  },
};
