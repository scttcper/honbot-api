import * as debug from 'debug';
import * as kcors from 'kcors';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import * as koaRaven from 'koa2-raven';
import * as _ from 'lodash';
import * as Raven from 'raven';
import { Rating, TrueSkill } from 'ts-trueskill';

import config from '../config';
import mongo from './db';

const log = debug('honbot');
const ts = new TrueSkill(null, null, null, null, 0);

const app = module.exports = new Koa();
app.proxy = true;
if (process.env.NODE_ENV !== 'dev') {
  const client = Raven
    .config(config.dsn)
    .install({ unhandledRejection: true });
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

router.get('/season/:nickname', async(ctx, next) => {
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

router.get('/playerMatches/:nickname', async(ctx, next) => {
  const lower = ctx.params.nickname.toLowerCase();
  const query = {
    'failed': { $exists : false },
    'players.lowercaseNickname': lower,
  };
  const db = await mongo;
  ctx.body = await db.collection('matches').find(query).sort({ match_id: -1 }).toArray();
  return next();
});

router.get('/match/:matchId', async(ctx, next) => {
  const query = { match_id: parseInt(ctx.params.matchId, 10), failed: { $exists : false } };
  const db = await mongo;
  const match = await db.collection('matches').findOne(query);
  ctx.assert(match, 404);
  ctx.body = match;
  return next();
});

router.get('/matchSkill/:matchId', async(ctx, next) => {
  const query = { match_id: parseInt(ctx.params.matchId, 10), failed: { $exists : false } };
  const db = await mongo;
  const match = await db.collection('matches').findOne(query);
  ctx.assert(match, 404);
  const accountIds = match.players.map((n) => n.account_id);
  const players = await db.collection('trueskill').find({ _id: { $in: accountIds }}).toArray();
  const teams = [[], []];
  for (const p of match.players) {
    const cur = _.find(players, _.matchesProperty('_id', p.account_id));
    const r = new Rating(cur.mu, cur.sigma);
    teams[p.team - 1].push(r);
  }
  const quality = ts.quality(teams);
  const sum = _.sumBy(players, 'mu');
  const averageScore = sum / players.length;
  const oddsTeam1Win = ts.winProbability(teams[0], teams[1]);
  ctx.body = {
    quality,
    averageScore,
    trueskill: players,
    oddsTeam1Win,
  };
  return next();
});

app.use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`listening on port: ${config.port}`);
}
