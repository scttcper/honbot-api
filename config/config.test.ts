module.exports = {
  username: '',
  database: 'hontest',
  password: '',
  db: {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 10,
      min: 1,
      idle: 1000,
    },
    logging: false,
  },
  token: 'test',
  port: 5000,
  dsn: false,
  twitch: 'testclient',
};
