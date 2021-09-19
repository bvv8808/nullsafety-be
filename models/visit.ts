import { INTEGER, Sequelize, STRING } from "sequelize";

const Visit = (sequelize: Sequelize) =>
  sequelize.define(
    "visit",
    {
      ym: {
        type: STRING(7),
        allowNull: false,
      },
      d: {
        type: STRING(2),
        allowNull: false,
      },
      visited: {
        type: INTEGER,
        defaultValue: 1,
      },
    },
    {
      timestamps: false,
    }
  );

module.exports = Visit;
