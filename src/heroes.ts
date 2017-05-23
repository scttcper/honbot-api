import * as _ from 'lodash';
import * as moment from 'moment';

import { Heropick, PlayerAttributes } from '../models';
import { client, getCache } from './redis';

/**
 * Uses match date to update pick w/l for hero_id
 */
export async function heroPick(players: PlayerAttributes[], day: Date) {
  const date = moment(day).startOf('day').toDate();
  const heroIds = players.map((n) => n.hero_id);
  const heroes = await Heropick
    .findAll({ where: { hero_id: {$in: heroIds }, date } });
  return Promise.all(players.map((p) => {
    if (p.hero_id === 0) {
      return;
    }
    let inc = 'win';
    if (!p.win) {
      inc = 'loss';
    }
    const hero = _.find(heroes, (h) => h.get('hero_id') === p.hero_id);
    if (hero) {
      return hero.increment(inc);
    }
    return Heropick
      .findOrCreate({ where: { date, hero_id: p.hero_id } })
      .then(([h, created]) => h.increment(inc));
  }));
}

export async function heroStats() {
  const cache = await getCache('herostats:cache');
  if (cache) {
    return JSON.parse(cache);
  }
  const db: any = {};
  const limit = moment().startOf('day').subtract(14, 'days').toDate();
  const yesterday = moment().startOf('day').subtract(1, 'days').toDate();
  const m = db
    .collection('matches')
    .count({
      date: { $gte: limit, $lte: yesterday },
      type: {$in: ['ranked', 'season']},
    });
  const h = db
    .collection('heropicks')
    .find({ date: { $gte: limit, $lte: yesterday } }, { _id: 0 })
    .sort({ date: -1 })
    .toArray();
  const [matches, heroes] = await Promise.all<any>([m, h]);
  const res: any = {};
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
    n.wr = Math.round((n.win / (n.loss + n.win) * 10000)) / 10000;
    week[n.hero_id].push(n);
  });
  res.week = week;
  res.avg = Object.values(avg)
    .map((n: any) => {
      n.wr = Math.round((n.win / (n.loss + n.win) * 10000)) / 10000;
      n.pr = (n.win + n.loss) / matches;
      return n;
    })
    .sort((a, b) => b.wr - a.wr);
  client.setex('herostats:cache', 1200, JSON.stringify(res));
  return res;
}
