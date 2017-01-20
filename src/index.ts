import * as debug from 'debug';
import * as kcors from 'kcors';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import * as koaRaven from 'koa2-raven';
import * as Raven from 'raven';

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

app.use(kcors());
app.use((ctx, next) => {
  ctx.type = 'json';
  return next();
});

const router = new Router();

router.get('/season/:nickname', async function getPlayer(ctx, next) {
  const lower = ctx.params.nickname.toLowerCase();
  const query = {
    'players.lowercaseNickname': lower,
    'setup.alt_pick': 1,
    'setup.nl': 1,
    'setup.officl': 1,
  };
  const db = await mongo;
  ctx.body = await db.collection('matches').find(query).sort({ match_id: -1 }).toArray();
  return next();
});

router.get('/playerMatches/:nickname', async function getPlayer(ctx, next) {
  const lower = ctx.params.nickname.toLowerCase();
  const query = { 'players.lowercaseNickname': lower };
  const db = await mongo;
  ctx.body = await db.collection('matches').find(query).sort({ match_id: -1 }).toArray();
  return next();
});

router.get('/match/:matchId', async function getPlayer(ctx, next) {
  const query = { match_id: parseInt(ctx.params.matchId, 10) };
  const db = await mongo;
  ctx.body = await db.collection('matches').findOne(query);
  return next();
});

app.use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`listening on port: ${config.port}`);
}
