const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/config"); 

const db = {};


db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.User = require("./user.model")(sequelize, DataTypes);
db.Game = require("./game.model")(sequelize, DataTypes);


if (db.Game.associate) {
  db.Game.associate(db);
}

module.exports = db;
