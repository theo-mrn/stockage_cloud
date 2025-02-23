'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    }
  }, {
    timestamps: true,
    createdAt: 'createdat',
    updatedAt: 'updatedat'
  });

  User.associate = function(models) {
    User.hasMany(models.File, {
      foreignKey: 'userId',
      as: 'files'
    });
  };

  return User;
};
