const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/config"); // Import sequelize instance

const db = {};

// Attach Sequelize instance
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models correctly
db.User = require("./user.model")(sequelize, DataTypes);
db.Game = require("./game.model")(sequelize, DataTypes);

// Check if the models have an associate method before calling it
if (db.Game.associate) {
  db.Game.associate(db);
}

module.exports = db;
