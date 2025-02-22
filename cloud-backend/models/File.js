module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filepath: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {  // Sequelize mappe `createdAt` sur `createdat`
      type: DataTypes.DATE,
      allowNull: false,
      field: "createdat"
    }
  }, {
    tableName: "files",
    timestamps: true
  });

  return File;
};
