module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      gameid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      game_state: {
        type: DataTypes.JSONB, 
        allowNull: false,
      },
      userid: {
        type: DataTypes.INTEGER,
        allowNull: true, 
      },
    },
    {
      timestamps: true,
    }
  );

  // Define associations
  Game.associate = (db) => {
    Game.belongsTo(db.User, { foreignKey: "userid" });
  };

  return Game;
};
