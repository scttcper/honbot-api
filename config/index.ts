import * as debug from 'debug';

const log = debug('honbot');
log(`Env: ${process.env.NODE_ENV || 'test'}`);

let config = {
  db: 'mongodb://127.0.0.1/hontest',
  token: 'test',
  port: 5000,
  retries: 5,
  dsn: '',
  STARTING_MATCH_ID: 147503111,
  twitch: '',
};

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
  const filename = `./config.${process.env.NODE_ENV}`;
  log(`Using: ${filename}`);
  const imported = require(filename);
  config = Object.assign({}, config, imported);
}

export default config;
