import { Sequelize } from "sequelize";

const SequelizeConstructor = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db: any = {};
try {
  const sequelize: Sequelize = new SequelizeConstructor(
    config.database,
    config.username,
    config.password,
    config
  );
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  db.Category = require("./category")(sequelize);
  db.Content = require("./content")(sequelize);
  db.Visitor = require("./visitor")(sequelize);
  db.Visit = require("./visit")(sequelize);
  db.Img = require("./img")(sequelize);
  db.Like = require("./like")(sequelize);

  db.Category.hasMany(db.Content, {
    foreignKey: "cid",
    sourceKey: "id",
  });
} catch (e) {
  console.warn("DB Error:::::: ", e);
}
module.exports = db;
