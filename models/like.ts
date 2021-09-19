import { INTEGER, Sequelize, STRING } from "sequelize";

const Like = (sequelize: Sequelize) =>
  sequelize.define(
    "like",
    {
      host: {
        type: STRING(50),
        allowNull: false,
      },
      cid: {
        type: INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

module.exports = Like;
