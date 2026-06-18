"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable(
        { tableName: "at_guideline_result", schema: "public" },
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
          },
          guideline_config_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: { tableName: "at_guideline_config", schema: "public" },
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          existing_guideline: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          scrape: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          analysis_result: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          generated_guideline: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          is_confirmed: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
          },
          active_status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          created_by: {
            type: Sequelize.UUID,
            allowNull: true,
          },
          updated_by: {
            type: Sequelize.UUID,
            allowNull: true,
          },
        },
      );
    } catch (error) {
      throw new Error(
        `Migration up failed for at_guideline_result: ${error instanceof Error ? error.message : error}`,
      );
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable({
        tableName: "at_guideline_result",
        schema: "public",
      });
    } catch (error) {
      throw new Error(
        `Migration down failed for at_guideline_result: ${error instanceof Error ? error.message : error}`,
      );
    }
  },
};
