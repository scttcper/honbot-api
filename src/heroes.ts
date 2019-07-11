/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { startOfDay, subDays } from 'date-fns';
import * as _ from 'lodash';
import { In } from 'typeorm';

import { getConnection } from './db';
import { Heropick } from './entity/Heropick';
import { Match } from './entity/Match';
import { Player } from './entity/Player';

/**
 * Uses match date to update pick w/l for hero_id
 */
export async function heroPick(players: Player[], day: Date): Promise<any> {
  const date = startOfDay(new Date(day));
  const heroIds = players.map(n => n.hero_id);
  const conn = await getConnection();
  const heroes = await conn.getRepository(Heropick).find({ id: In(heroIds), date });
  return Promise.all(players.map(async p => {
    if (p.hero_id === 0) {
      return;
    }

    let inc: 'win' | 'loss' = 'win';
    if (!p.win) {
      inc = 'loss';
    }

    const hero = heroes.find(h => h.hero_id === p.hero_id);
    if (hero) {
      return conn.getRepository(Heropick).increment(hero, inc, 1);
    }

    const nh = new Heropick();
    nh.hero_id = p.hero_id;
    nh.date = date;
    return conn.manager.save(nh).catch(async () => {
      return conn.getRepository(Heropick).increment(nh, inc, 1);
    });
  }));
}

export async function heroStats() {
  const startDay = startOfDay(new Date());
  const limit = subDays(startDay, 14);
  const yesterday = subDays(startDay, 1);
  const conn = await getConnection();
  const matches = await conn.createQueryBuilder().select('match').from(Match, 'match')
    .where('match.date BETWEEN :min AND :max', { min: limit, max: yesterday })
    .andWhere('match.type IN (:...types)', { types: ['ranked', 'season'] })
    .getCount();
  const heroes = await conn.createQueryBuilder().select('heropick').from(Heropick, 'heropick')
    .where('heropick.date BETWEEN :min AND :max', { min: limit, max: yesterday })
    .orderBy('heropick.date', 'DESC')
    .getMany();
  const res = { avg: {}, week: {} };
  const avgCalc = {};
  heroes.forEach((n: any) => {
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
  return res;
}
