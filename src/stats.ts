import * as moment from 'moment';

import mongo from './db';
import { client, getCache } from './redis';

export default async function stats() {
  const cache = await getCache('stats:cache');
  if (cache) {
    return JSON.parse(cache);
  }
  const db = await mongo;
  const m = db
    .collection('matches')
    .count({ failed: false });
  const lastDayDate = moment().subtract(1, 'days').subtract(140, 'minutes').toDate();
  const ld = db
    .collection('matches')
    .count({ date: { $gt: lastDayDate }, failed: false });
  const s = db.stats({ scale: 1024 * 1024 });
  const [matches, lastDay, stats] = await Promise.all<any>([m, ld, s]);
  const disksize = Math.round((stats.dataSize / 1024) * 100) / 100;
  const res = { matches, lastDay, disksize };
  client.setex('stats:cache', 600, JSON.stringify(res));
  return res;
}
