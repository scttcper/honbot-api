import * as Router from 'koa-router';
import * as _ from 'lodash';

import { Players, Matches, Trueskill, PlayerAttributes } from '../models';
import { heroStats } from './heroes';
import { matchSkill } from './skill';
import getTwitchStreams from './twitch';
import { playerMatches, playerCompetition } from './playerMatches';
import stats from './stats';

const router = new Router();

router.get('/playerMatches/:nickname', async (ctx, next) => {
  const lowercaseNickname = ctx.params.nickname.toLowerCase();
  ctx.body = await playerMatches(lowercaseNickname);
  ctx.assert(ctx.body.matches && ctx.body.matches.length, 404);
  return next();
});

router.get('/playerCompetition/:nickname', async (ctx, next) => {
  const lowercaseNickname = ctx.params.nickname.toLowerCase();
  ctx.body = await playerCompetition(lowercaseNickname);
  return next();
});

router.get('/twitchStreams', async (ctx, next) => {
  ctx.body = await getTwitchStreams();
  return next();
});

router.get('/match/:matchId', async (ctx, next) => {
  const id = parseInt(ctx.params.matchId, 10);
  ctx.assert(_.isFinite(id), 400, 'Match ID must be number');
  ctx.assert(id >= 149396730, 400, 'Match ID does not exist');
  const match = await Matches.findById(id, {
    include: [{ model: Players }],
  });
  ctx.assert(match, 404, 'Match not found');
  ctx.body = match;
  return next();
});

router.get('/matchSkill/:matchId', async (ctx, next) => {
  const id = parseInt(ctx.params.matchId, 10);
  ctx.assert(_.isFinite(id), 400, 'Match ID must be number');
  ctx.assert(id >= 149396730, 400, 'Match ID does not exist');
  const query = { id, setup_nl: 1, setup_officl: 1 };
  const match = await Matches.findOne({
    where: query,
    include: [{ model: Players }],
  });
  ctx.assert(match, 404);
  const players: PlayerAttributes[] = match.get('players');
  ctx.assert(players.length > 1, 404);
  ctx.body = await matchSkill(players);
  ctx.assert(ctx.body, 404);
  return next();
});

router.get('/playerSkill/:accountId', async (ctx, next) => {
  const accountId = parseInt(ctx.params.accountId, 10);
  ctx.assert(_.isFinite(accountId), 400, 'AccountId must be number');
  const skill = await Trueskill.findById(accountId, { raw: true });
  ctx.body = skill;
  ctx.assert(ctx.body, 404);
  return next();
});

router.get('/latestMatches', async (ctx, next) => {
  const matches = await Matches.findAll({
    include: [{ model: Players }],
    order: 'id DESC',
    limit: 10,
  });
  ctx.body = matches;
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

export default router;
