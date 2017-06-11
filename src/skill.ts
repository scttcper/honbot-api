import * as _ from 'lodash';
import * as Sequelize from 'sequelize';
import { Rating, TrueSkill } from 'ts-trueskill';

import { Trueskill } from '../models';
import { PlayerAttributes, TrueskillAttributes } from '../models/interfaces';

const ts = new TrueSkill(null, null, null, null, 0);

export async function calculatePlayerSkill(players: PlayerAttributes[]) {
  const accountIds = players.map(n => n.account_id);
  const res = await Trueskill.findAll({
    where: { account_id: { $in: accountIds } },
  }).then(n => n.map(x => x.toJSON()));
  // const found = current.map((n) => n.account_id);
  // const missing = _.difference(found, accountIds);
  const teams = [[], []];
  const teamIds = [[], []];
  const teamCreate: boolean[][] = [[], []];
  const teamWin = [0, 0];
  for (const p of players) {
    const cur: TrueskillAttributes = _.find(
      res,
      _.matchesProperty('account_id', p.account_id),
    );
    let r: Rating;
    let create: boolean;
    if (cur) {
      create = false;
      r = new Rating(cur.mu, cur.sigma);
    } else {
      create = true;
      r = new Rating();
    }
    if (p.team === 0) {
      continue;
    }
    teams[p.team - 1].push(r);
    teamCreate[p.team - 1].push(create);
    teamIds[p.team - 1].push(p.account_id);
    teamWin[p.team - 1] += +p.win;
  }
  if (!teams[0].length || !teams[1].length) {
    return;
  }
  const result: Rating[][] = ts.rate(teams, [
    Number(teamWin[0] < teamWin[1]),
    Number(teamWin[1] < teamWin[0]),
  ]);
  const flattenedResults = _.flatten(result);
  const flattendedTeamIds = _.flatten(teamIds);
  const flattendedTeamCreate = _.flatten(teamCreate);
  const updates = [];
  _.forEach(flattendedTeamIds, (value, key) => {
    const q: any = {
      account_id: value,
      mu: flattenedResults[key].mu,
      sigma: flattenedResults[key].sigma,
      games: Sequelize.literal('games + 1'),
    };
    if (flattendedTeamCreate[key]) {
      q.games = 1;
      return updates.push(Trueskill.create(q, { returning: false }));
    }
    return updates.push(Trueskill.update(q, { where: { account_id: value } }));
  });
  return Promise.all(updates);
}

export async function matchSkill(players: PlayerAttributes[]) {
  const accountIds = players.map(n => n.account_id);
  const pls = await Trueskill.findAll({
    where: { account_id: { $in: accountIds } },
  }).then(n => n.map(x => x.toJSON()));
  const teams = [[], []];
  for (const p of players) {
    const cur: TrueskillAttributes = _.find(
      pls,
      _.matchesProperty('account_id', p.account_id),
    );
    const r = new Rating(cur.mu, cur.sigma);
    teams[p.team - 1].push(r);
  }
  if (!teams[0].length || !teams[1].length) {
    return;
  }
  const quality = ts.quality(teams);
  const sum = _.sumBy(pls, 'mu');
  const averageScore = sum / pls.length;
  const oddsTeam1Win = ts.winProbability(teams[0], teams[1]);
  return {
    quality,
    averageScore,
    trueskill: pls,
    oddsTeam1Win,
  };
}
