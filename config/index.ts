import * as debug from 'debug';

const log = debug('honbot');
log(`Env: ${process.env.NODE_ENV || 'test'}`);

let config = {
  username: '',
  database: 'hon',
  password: '',
  db: {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 1000,
    },
  },
  token: 'test',
  port: 5000,
  retries: 5,
  dsn: '',
  // STARTING_MATCH_ID: 147503111,
  STARTING_MATCH_ID: 149396730,
  twitch: '',
};

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
  const filename = `./config.${process.env.NODE_ENV}`;
  log(`Using: ${filename}`);
  const imported = require(filename);
  config = Object.assign({}, config, imported);
}

export default config;
