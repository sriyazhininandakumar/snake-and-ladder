module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    userid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  }, {
    timestamps: true,
  });

  return User;
};
