import * as debug from 'debug';

const log = debug('honbot');
const env = process.env.NODE_ENV || 'test';
log(`Env: ${env}`);

let config = {
  username: '',
  database: 'hontest',
  password: '',
  db: {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 1000,
    },
    logging: false,
    operatorsAliases: false,
  },
  token: 'test',
  port: 5000,
  dsn: '',
  twitch: '',
};

const filename = `./config.${env}`;
log(`Using: ${filename}`);
const imported = require(filename);
config = { ...config, ...imported };

export default config;
