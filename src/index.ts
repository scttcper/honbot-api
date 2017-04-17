import * as debug from 'debug';
import * as kcors from 'kcors';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import * as koaRaven from 'koa2-raven';
import * as Raven from 'raven';

import config from '../config';
import mongo from './db';
import { heroStats } from './heroes';
import playerMatches from './playerMatches';
import { matchSkill } from './skill';
import stats from './stats';
import getTwitchStreams from './twitch';

const log = debug('honbot');

const app = module.exports = new Koa();
app.proxy = true;
if (process.env.NODE_ENV !== 'dev') {
  const ravenClient = Raven
    .config(config.dsn)
    .install({ captureUnhandledRejections: true });
  koaRaven(app, ravenClient);
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

router.get('/playerMatches/:nickname', async (ctx, next) => {
  const lowercaseNickname = ctx.params.nickname.toLowerCase();
  ctx.body = await playerMatches(lowercaseNickname);
  ctx.assert(ctx.body.matches && ctx.body.matches.length, 404);
  return next();
});

router.get('/twitchStreams', async (ctx, next) => {
  ctx.body = await getTwitchStreams();
  return next();
});

router.get('/match/:matchId', async (ctx, next) => {
  const query = { match_id: parseInt(ctx.params.matchId, 10), failed: false };
  const db = await mongo;
  const match = await db.collection('matches').findOne(query);
  ctx.assert(match, 404);
  ctx.body = match;
  return next();
});

router.get('/matchSkill/:matchId', async (ctx, next) => {
  const query = {
    'match_id': parseInt(ctx.params.matchId, 10),
    'failed': false,
    'setup.nl': 1,
    'setup.officl': 1,
  };
  const db = await mongo;
  const match = await db.collection('matches').findOne(query);
  ctx.assert(match, 404);
  ctx.assert(match.players.length > 1, 404);
  ctx.body = await matchSkill(match);
  ctx.assert(ctx.body, 404);
  return next();
});

router.get('/playerSkill/:accountId', async (ctx, next) => {
  const accountId = parseInt(ctx.params.accountId, 10);
  ctx.assert(accountId, 404);
  const db = await mongo;
  ctx.body = await db.collection('trueskill')
    .findOne({ _id: accountId });
  ctx.assert(ctx.body, 404);
  return next();
});

router.get('/latestMatches', async (ctx, next) => {
  const db = await mongo;
  ctx.body = await db
    .collection('matches')
    .find({ failed: false })
    .sort({ match_id: -1 })
    .limit(10)
    .toArray();
  return next();
});

router.get('/stats', async (ctx, next) => {
  ctx.body = await stats();
  return next();
});

router.get('/herostats', async (ctx, next) => {
  ctx.body = await heroStats();
  return next();
});

app.use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`listening on port: ${config.port}`);
}
