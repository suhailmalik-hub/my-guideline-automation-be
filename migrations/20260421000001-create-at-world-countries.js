"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable(
        { tableName: "at_world_countries", schema: "public" },
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
          name: {
            type: Sequelize.STRING(250),
            allowNull: false,
          },
          alpha2: {
            type: Sequelize.STRING(2),
            allowNull: false,
          },
          alpha3: {
            type: Sequelize.STRING(3),
            allowNull: false,
          },
        },
      );
    } catch (error) {
      throw new Error(
        `Migration up failed for at_world_countries: ${error instanceof Error ? error.message : error}`,
      );
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable({
        tableName: "at_world_countries",
        schema: "public",
      });
    } catch (error) {
      throw new Error(
        `Migration down failed for at_world_countries: ${error instanceof Error ? error.message : error}`,
      );
    }
  },
};
