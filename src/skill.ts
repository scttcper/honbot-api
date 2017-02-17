import * as _ from 'lodash';
import { Rating, TrueSkill } from 'ts-trueskill';

import mongo from './db';

const ts = new TrueSkill(null, null, null, null, 0);

export async function calculatePlayerSkill(players: any[], matchId: number) {
  const accountIds = players.map((n) => n.account_id);
  const db = await mongo;
  const query = { _id: { $in: accountIds }};
  const res = await db.collection('trueskill').find(query).toArray();
  // const found = current.map((n) => n.account_id);
  // const missing = _.difference(found, accountIds);
  const teams = [[], []];
  const teamIds = [[], []];
  const teamWin = [0, 0];
  for (const p of players) {
    const cur = _.find(res, _.matchesProperty('_id', p.account_id));
    let r;
    if (!cur) {
      r = new Rating();
    } else {
      r = new Rating(cur.mu, cur.sigma);
    }
    teams[p.team - 1].push(r);
    teamIds[p.team - 1].push(p.account_id);
    teamWin[p.team - 1] += p.win;
  }
  if (!teams[0].length || !teams[1].length) {
    return;
  }
  const result = ts.rate(teams, [
    Number(teamWin[0] < teamWin[1]),
    Number(teamWin[1] < teamWin[0]),
  ]);
  const zipped = _.zip(_.flatten(teamIds), _.flatten(result));
  for (const n of zipped) {
    const [a, r] = n;
    const save = {
      $set: {
        mu: r.mu,
        sigma: r.sigma,
      },
      $inc: { games: 1 },
    };
    await db.collection('trueskill').updateOne({ _id: a }, save, { upsert: true });
  }
}

export async function matchSkill(match: any) {
  const db = await mongo;
  const accountIds = match.players.map((n) => n.account_id);
  const players = await db.collection('trueskill').find({ _id: { $in: accountIds }}).toArray();
  const teams = [[], []];
  for (const p of match.players) {
    const cur = _.find(players, _.matchesProperty('_id', p.account_id));
    const r = new Rating(cur.mu, cur.sigma);
    teams[p.team - 1].push(r);
  }
  if (teams[0].length || teams[1].length) {
    return;
  }
  const quality = ts.quality(teams);
  const sum = _.sumBy(players, 'mu');
  const averageScore = sum / players.length;
  const oddsTeam1Win = ts.winProbability(teams[0], teams[1]);
  return {
    quality,
    averageScore,
    trueskill: players,
    oddsTeam1Win,
  };
}
