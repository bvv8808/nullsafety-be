import { INTEGER, Sequelize, STRING } from "sequelize";

const Category = (sequelize: Sequelize) =>
  sequelize.define(
    "category",
    {
      name: {
        type: STRING(50),
        allowNull: false,
      },
      priority: {
        type: INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

module.exports = Category;
