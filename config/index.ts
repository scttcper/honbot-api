import path from 'path';
import debug from 'debug';

const log = debug('honbot');
const env = process.env.NODE_ENV || 'test';
log(`Env: ${env}`);

let config = {
  db: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    database: 'honlocal',
    entities: [path.join(__dirname, '../src/entity/*.ts')],
    synchronize: false,
  },
  token: 'test',
  port: 5000,
  dsn: '',
  twitch: '',
};

const filename = `./config.${env}`;
log(`Using: ${filename}`);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const imported = require(filename);
config = { ...config, ...imported };

export default config;
