import * as debug from 'debug';
import * as kcors from 'kcors';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import * as koaRaven from 'koa2-raven';
import * as moment from 'moment';
import * as Raven from 'raven';

import config from '../config';
import mongo from './db';
import playerMatches from './playerMatches';
import { client, getCache } from './redis';
import { matchSkill } from './skill';
import stats from './stats';
import getTwitchStreams from './twitch';

const log = debug('honbot');

const app = module.exports = new Koa();
app.proxy = true;
if (process.env.NODE_ENV !== 'dev') {
  const ravenClient = Raven
    .config(config.dsn)
    .install({ unhandledRejection: true });
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
  const cache = await getCache('herostats:cache');
  if (cache) {
    ctx.body = JSON.parse(cache);
    return next();
  }
  const db = await mongo;
  const limit = moment().startOf('day').subtract(14, 'days').toDate();
  const yesterday = moment().startOf('day').subtract(1, 'days').toDate();
  const matches = await db
    .collection('matches')
    .count({
      date: { $gte: limit, $lte: yesterday },
      type: {$in: ['ranked', 'season']},
    });
  const heroes = await db
    .collection('heropicks')
    .find({ date: { $gte: limit, $lte: yesterday } }, { _id: 0 })
    .sort({ date: -1 })
    .toArray();
  ctx.body = {};
  const avg = {};
  const week = {};
  heroes.map((n) => {
    if (!avg[n.hero_id]) {
      avg[n.hero_id] = { hero_id: n.hero_id, win: 0, loss: 0 };
    }
    if (!week[n.hero_id]) {
      week[n.hero_id] = [];
    }
    n.win = n.win || 0;
    n.loss = n.loss || 0;
    avg[n.hero_id].win += n.win;
    avg[n.hero_id].loss += n.loss;
    n.percent = Math.round((n.win / (n.loss + n.win) * 10000)) / 10000;
    week[n.hero_id].push(n);
  });
  ctx.body.week = week;
  ctx.body.avg = Object.values(avg)
    .map((n: any) => {
      n.percent = Math.round((n.win / (n.loss + n.win) * 10000)) / 10000;
      n.pickRate = (n.win + n.loss) / matches;
      return n;
    })
    .sort((a, b) => b.percent - a.percent);
  client.setex('herostats:cache', 1200, JSON.stringify(ctx.body));
  return next();
});

app.use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`listening on port: ${config.port}`);
}
