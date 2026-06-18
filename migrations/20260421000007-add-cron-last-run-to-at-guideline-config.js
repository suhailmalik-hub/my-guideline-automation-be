"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      { tableName: "at_guideline_config", schema: "public" },
      "cron_last_run",
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      { tableName: "at_guideline_config", schema: "public" },
      "cron_last_run",
    );
  },
};
