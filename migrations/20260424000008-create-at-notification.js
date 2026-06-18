"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: "at_notification", schema: "public" },
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal("gen_random_uuid()"),
        },
        readable_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          autoIncrement: true,
          unique: true,
        },
        automation_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: { tableName: "at_guideline_config", schema: "public" },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        notification_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        read_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({
      tableName: "at_notification",
      schema: "public",
    });
  },
};
