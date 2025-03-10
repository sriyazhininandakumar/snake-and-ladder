module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Games", {
      gameid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "userid"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      game_state: {
        type: Sequelize.JSON,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Games");
  }
};
