"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable(
        { tableName: "at_sub_visa_types", schema: "public" },
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
          destination_country_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: {
                tableName: "at_destination_countries",
                schema: "public",
              },
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          destination_country: {
            type: Sequelize.STRING(250),
            allowNull: false,
          },
          visa_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: { tableName: "at_visa_types", schema: "public" },
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          visa_name: {
            type: Sequelize.STRING(250),
            allowNull: false,
          },
          sub_visa_name: {
            type: Sequelize.STRING(250),
            allowNull: false,
          },
          active_status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true,
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
        `Migration up failed for at_sub_visa_types: ${error instanceof Error ? error.message : error}`,
      );
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable({
        tableName: "at_sub_visa_types",
        schema: "public",
      });
    } catch (error) {
      throw new Error(
        `Migration down failed for at_sub_visa_types: ${error instanceof Error ? error.message : error}`,
      );
    }
  },
};
