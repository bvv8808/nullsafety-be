import { INTEGER, Sequelize, STRING } from "sequelize";

const Visitor = (sequelize: Sequelize) =>
  sequelize.define(
    "visitor",
    {
      host: {
        type: STRING(50),
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
    }
  );

module.exports = Visitor;
