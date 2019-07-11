import { startOfDay, subDays } from 'date-fns';
import * as _ from 'lodash';

import { flushdb, getConnection } from '../src/db';
import { Failed } from '../src/entity/Failed';
import { Match } from '../src/entity/Match';
import { Player } from '../src/entity/Player';
import { parseMultimatch, findNewest } from '../src/matches';
import { multimatch } from './data/multimatch';

describe('honbot', () => {
  before('should setup database', async () => {
    await flushdb();
  });
  it('should load multimatch', async () => {
    const matchIds = multimatch[0].map(n => n.match_id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [matches, players, failed] = await parseMultimatch(
      multimatch,
      matchIds,
    );
    const conn = await getConnection();
    await conn
      .createQueryBuilder()
      .insert()
      .into(Match)
      .values(matches)
      .execute();
    const pls = _.flatten(players);
    await conn
      .createQueryBuilder()
      .insert()
      .into(Player)
      .values(pls)
      .execute();
    const pids = matches.map(n => n.id);
    console.log('swag');
    console.log(pids);
    await conn.getRepository(Failed).delete(pids);

    const startDay = startOfDay(new Date());
    const limit = subDays(new Date('2012-01-01'), 14);
    const yesterday = subDays(startDay, 1);
    await conn
      .createQueryBuilder()
      .select('match')
      .from(Match, 'match')
      .where('match.date BETWEEN :min AND :max', { min: limit, max: yesterday })
      .andWhere('match.type IN (:...types)', { types: ['ranked', 'season'] })
      .leftJoinAndSelect('match.players', 'players')
      .getMany();
  });
  it('should find newest', async () => {
    await findNewest();
  });
});
