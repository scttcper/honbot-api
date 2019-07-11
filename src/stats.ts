import { subDays, subMinutes } from 'date-fns';

import { Match } from './entity/Match';
import { getConnection } from './db';

export interface Stats {
  matches: number;
  loadedLastDay: number;
}

export default async function stats(): Promise<Stats> {
  const conn = await getConnection();
  // postgres specific fast estimate
  const matchRes = await conn
    .createEntityManager()
    .query(
      'SELECT reltuples::bigint AS estimate FROM pg_class where relname=\'matches\';',
    );
  const matches = Number(matchRes[0].estimate);
  const lastDayDate = subMinutes(subDays(new Date(), 1), 180);
  const loadedLastDay = await conn
    .createQueryBuilder()
    .select('match')
    .from(Match, 'match')
    .where('match.createdAt > :date', { date: lastDayDate })
    .getCount();
  return { matches, loadedLastDay };
}
