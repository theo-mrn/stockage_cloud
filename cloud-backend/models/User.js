module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {  // Sequelize utilise `createdAt`, mais on le mappe sur `createdat`
      type: DataTypes.DATE,
      allowNull: false,
      field: "createdat"
    },
    updatedAt: {  // Sequelize utilise `updatedAt`, mais on le mappe sur `updatedat`
      type: DataTypes.DATE,
      allowNull: false,
      field: "updatedat"
    }
  }, {
    tableName: "users",
    timestamps: true
  });

  return User;
};
