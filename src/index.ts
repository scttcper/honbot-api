import * as debug from 'debug';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import * as koaRaven from 'koa2-raven';
import Raven from 'raven';

import config from '../config';
import mongo from './db';

const log = debug('honbot');

const app = module.exports = new Koa();
app.proxy = true;
if (process.env.NODE_ENV !== 'dev') {
  const client = Raven
    .config(config.dsn)
    .install({ unhandledRejection: false });
  koaRaven(app, client);
}

if (process.env.NODE_ENV === 'dev') {
  app.use(logger());
}

app.use((ctx, next) => {
  ctx.type = 'json';
  return next();
});

const router = new Router();
router.get('/playermatches/season/:nickname', async function getPlayer(ctx, next) {
  log(ctx.params);
  const lower = ctx.params.nickname.toLowerCase();
  const query = {
    'players.lowercaseNickname': lower,
    'setup.alt_pick': 1,
    'setup.nl': 1,
    'setup.officl': 1,
  };
  const db = await mongo;
  ctx.body = await db.collection('matches').find(query).toArray();
  return next();
});

app.use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  debug(`listening on port: ${config.port}`);
}
