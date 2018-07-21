import * as _ from 'lodash';
import { Rating, TrueSkill } from 'ts-trueskill';
import { In } from 'typeorm';

import { Trueskill } from './entity/Trueskill';
import { Player } from './entity/Player';
import { getConnection } from './db';

const ts = new TrueSkill(undefined, undefined, undefined, undefined, 0);

export async function calculatePlayerSkill(players: Player[]) {
  const accountIds = players.map(n => n.account_id);
  const conn = await getConnection();
  const res = await conn.getRepository(Trueskill).find({ account_id: In(accountIds) });
  // const found = current.map((n) => n.account_id);
  // const missing = _.difference(found, accountIds);
  const teams = [[], []];
  const teamIds = [[], []];
  const teamCreate: boolean[][] = [[], []];
  const teamWin = [0, 0];
  for (const p of players) {
    const cur = res.find(x => x.account_id === p.account_id);
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
  const updates = flattendedTeamIds.map((value, key) => {
    if (flattendedTeamCreate[key]) {
      const tsn = new Trueskill();
      tsn.account_id = value;
      tsn.mu = flattenedResults[key].mu;
      tsn.sigma = flattenedResults[key].sigma;
      tsn.games = 1;
      return conn.getRepository(Trueskill).insert(tsn);
    }
    const cur = res.find(x => x.account_id === value);
    cur.account_id = value;
    cur.mu = flattenedResults[key].mu;
    cur.sigma = flattenedResults[key].sigma;
    cur.games += 1;
    return conn.getRepository(Trueskill).update(value, cur);
  });
  return Promise.all(updates);
}

export async function matchSkill(players: Player[]) {
  const accountIds = players.map(n => n.account_id);
  const conn = await getConnection();
  const pls = await conn.getRepository(Trueskill).find({ account_id: In(accountIds) });
  const teams = [[], []];
  for (const p of players) {
    const cur = pls.find(x => x.account_id === p.account_id);
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
