import { INTEGER, Sequelize, STRING } from "sequelize";

const Img = (sequelize: Sequelize) =>
  sequelize.define(
    "img",
    {
      path: {
        type: STRING(200),
        allowNull: false,
      },
      cid: {
        type: INTEGER,
        defaultValue: -1,
      },
    },
    {
      timestamps: false,
    }
  );

module.exports = Img;
