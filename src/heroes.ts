import * as _ from 'lodash';
import { startOfDay, subDays } from 'date-fns';

import { Heropick, Matches } from '../models';
import { PlayerAttributes } from '../models/interfaces';
import { client, getCache } from './redis';

/**
 * Uses match date to update pick w/l for hero_id
 */
export async function heroPick(players: PlayerAttributes[], day: Date): Promise<any> {
  const date = startOfDay(new Date(day));
  const heroIds = players.map((n) => n.hero_id);
  const heroes = await Heropick
    .findAll({ where: { hero_id: { $in: heroIds }, date } });
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
      .create({ date, hero_id: p.hero_id }, { returning: false })
      .catch((err) => {
        return Heropick.findOne({ where: { hero_id: p.hero_id, date }})
          .then(h => h.increment(inc));
      });
  }));
}

export async function heroStats() {
  const cache = await getCache('herostats:cache');
  if (cache) {
    return JSON.parse(cache);
  }
  const db: any = {};
  const startDay = startOfDay(new Date());
  const limit = subDays(startDay, 14);
  const yesterday = subDays(startDay, 1);
  const date = { $gt: limit, $lt: yesterday };
  const matches = await Matches
    .count({
      where: {
        date,
        type: { $in: ['ranked', 'season'] },
      },
    });
  const heroes = await Heropick
    .findAll({
      where: { date },
      order: [['date', 'DESC']],
    })
    .then(n => n.map(k => k.toJSON()));
  const res = { avg: {}, week: {} };
  const avgCalc = {};
  heroes.map((n: any) => {
    if (!avgCalc[n.hero_id]) {
      avgCalc[n.hero_id] = { hero_id: n.hero_id, win: 0, loss: 0 };
    }
    if (!res.week[n.hero_id]) {
      res.week[n.hero_id] = [];
    }
    n.win = n.win || 0;
    n.loss = n.loss || 0;
    avgCalc[n.hero_id].win += n.win;
    avgCalc[n.hero_id].loss += n.loss;
    n.wr = Math.round((n.win / (n.loss + n.win) * 10000)) / 10000;
    res.week[n.hero_id].push(n);
  });
  res.avg = _.values(avgCalc)
    .map((n: any) => {
      n.wr = Math.round((n.win / (n.loss + n.win) * 10000)) / 10000;
      n.pr = (n.win + n.loss) / matches;
      return n;
    })
    .sort((a, b) => b.wr - a.wr);
  client.setex('herostats:cache', 1200, JSON.stringify(res));
  return res;
}
