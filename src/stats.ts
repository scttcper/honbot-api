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
  const lastDay = await Matches.count({ where: { date: { $gt: lastDayDate } } });
  const disksize = await sequelize.query(`
  SELECT
    CASE WHEN pg_catalog.has_database_privilege(d.datname, 'CONNECT')
        THEN pg_catalog.pg_size_pretty(pg_catalog.pg_database_size(d.datname))
        ELSE 'No Access'
    END AS SIZE
  FROM pg_catalog.pg_database d
    WHERE d.datname = '${config.database}'
    ORDER BY
    CASE WHEN pg_catalog.has_database_privilege(d.datname, 'CONNECT')
        THEN pg_catalog.pg_database_size(d.datname)
        ELSE NULL
    END DESC -- nulls first
    LIMIT 20`).then((s) => s[0][0].size);
  const res = { matches, lastDay, disksize };
  client.setex('stats:cache', 600, JSON.stringify(res));
  return res;
}
