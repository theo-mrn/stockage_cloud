require('dotenv').config();

module.exports = {
  development: {
    username: 'cloud_user',
    password: 'password',
    database: 'cloud',
    host: 'localhost',
    dialect: 'postgres'
  },
  production: {
    username: 'cloud_user',
    password: 'password',
    database: 'cloud',
    host: 'localhost',
    dialect: 'postgres'
  }
};
