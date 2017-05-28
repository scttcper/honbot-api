import * as moment from 'moment';

import { Matches, sequelize } from '../models';
import config from '../config';
import { client, getCache } from './redis';

export default async function stats() {
  const cache = await getCache('stats:cache');
  if (cache) {
    return JSON.parse(cache);
  }
  const matches = await Matches.count();
  const lastDayDate = moment().subtract(1, 'days').subtract(140, 'minutes').toDate();
  const loadedLastDay = await Matches.count({ where: { createdAt: { $gt: lastDayDate } } });
  const res = { matches, loadedLastDay };
  client.setex('stats:cache', 600, JSON.stringify(res));
  return res;
}
