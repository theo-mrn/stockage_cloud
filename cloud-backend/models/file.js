'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filepath: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    color: {
      type: DataTypes.STRING
    },
    parentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Files',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    createdAt: 'createdat',
    updatedAt: 'updatedat'
  });

  File.associate = function(models) {
    File.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    File.belongsTo(models.File, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    File.hasMany(models.File, {
      foreignKey: 'parentId',
      as: 'children'
    });
  };

  return File;
};
