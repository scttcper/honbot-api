import * as path from 'path';

module.exports = {
  db: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    database: 'hontestdb',
    entities: [path.join(__dirname, '../src/entity/*.ts')],
    logging: false,
    synchronize: true,
  },
  token: 'test',
  port: 5000,
  dsn: false,
  twitch: 'testclient',
};
