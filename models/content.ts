import { BLOB, INTEGER, STRING, DATE, NOW, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) =>
  sequelize.define(
    "content",
    {
      title: {
        type: STRING(100),
        allowNull: false,
      },
      content: {
        type: BLOB("long"),
        allowNull: false,
      },
      hit: {
        type: INTEGER,
        defaultValue: 0,
      },
      liked: {
        type: INTEGER,
        defaultValue: 0,
      },
      thumbnail: {
        type: STRING(200),
        defaultValue: "",
      },
      createdAt: {
        type: DATE,
        defaultValue: NOW,
      },
    },
    {
      timestamps: false,
    }
  );
