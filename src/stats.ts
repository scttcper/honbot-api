import { subDays, subMinutes } from 'date-fns';

import { Matches, sequelize } from '../models';
import config from '../config';
import { client, getCache } from './redis';

export default async function stats() {
  const cache = await getCache('stats:cache');
  if (cache) {
    return JSON.parse(cache);
  }
  const matches = await Matches.count();
  const lastDayDate = subMinutes(subDays(new Date(), 1), 180);
  const loadedLastDay = await Matches.count({ where: { createdAt: { $gt: lastDayDate } } });
  const res = { matches, loadedLastDay };
  client.setex('stats:cache', 600, JSON.stringify(res));
  return res;
}
