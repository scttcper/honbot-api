import { subDays, subYears } from 'date-fns';
import { chunk } from 'lodash';

import { getConnection } from '../src/db';
import { Failed } from '../src/entity/Failed';
import { Heropick } from '../src/entity/Heropick';
import { Match } from '../src/entity/Match';
import { Player } from '../src/entity/Player';

async function loop() {
  const conn = await getConnection();
  const old = subDays(new Date(), 30);
  const unrankedDeleted = await conn
    .getRepository(Match)
    .createQueryBuilder('match')
    .select('match.id')
    .where('match.createdAt <= :old', { old })
    .andWhere('match.mode = :mode', { mode: 'Unknown' })
    .getMany();
  console.log('unranked', unrankedDeleted.length);
  if (unrankedDeleted.length > 0) {
    const chunks = chunk(unrankedDeleted, 100);
    for (const ch of chunks) {
      console.log(ch);
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const oldDevo = subDays(new Date(), 30);
  const oldDevoMatches = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.createdAt <= :old', { old: oldDevo })
    .andWhere('match.mode = :mode', { mode: 'Devo Wars' })
    .getMany();
  console.log('oldDevoMatches', oldDevoMatches.length);
  if (oldDevoMatches.length > 0) {
    const chunks = chunk(oldDevoMatches, 100);
    for (const ch of chunks) {
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const oldRift = subDays(new Date(), 30);
  const oldRiftMatches = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.createdAt <= :old', { old: oldRift })
    .andWhere('match.mode = :mode', { mode: 'Rift Wars' })
    .getMany();
  console.log('oldRiftMatches', oldRiftMatches.length);
  if (oldRiftMatches.length > 0) {
    const chunks = chunk(oldRiftMatches, 100);
    for (const ch of chunks) {
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const oldCapture = subDays(new Date(), 30);
  const oldCaptureMatches = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.createdAt <= :old', { old: oldCapture })
    .andWhere('match.mode = :mode', { mode: 'Capture the Flag' })
    .getMany();
  console.log('oldCaptureMatches', oldCaptureMatches.length);
  if (oldCaptureMatches.length > 0) {
    const chunks = chunk(oldCaptureMatches, 100);
    for (const ch of chunks) {
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const oldRanked = subYears(new Date(), 1);
  const oldRankedMatches = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.createdAt <= :old', { old: oldRanked })
    .andWhere('match.mode = :mode', { mode: 'Ranked' })
    .getMany();
  console.log('oldRankedMatches', oldRankedMatches.length);
  if (oldRankedMatches.length > 0) {
    const chunks = chunk(oldRankedMatches, 100);
    for (const ch of chunks) {
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const oldMidWars = subDays(new Date(), 90);
  const oldMidWarMatches = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.createdAt <= :old', { old: oldMidWars })
    .andWhere('match.mode = :mode', { mode: 'Mid Wars' })
    .getMany();
  console.log('oldMidWarMatches', oldMidWarMatches.length);
  if (oldMidWarMatches.length > 0) {
    const chunks = chunk(oldMidWarMatches, 100);
    for (const ch of chunks) {
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const removedSeason1 = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.mode = :mode', { mode: 'Season 2' })
    .getMany();
  console.log('removedSeason1', removedSeason1.length);
  if (removedSeason1.length > 0) {
    const chunks = chunk(removedSeason1, 100);
    for (const ch of chunks) {
      const matches = ch.map(x => x.id);
      await conn
        .createQueryBuilder()
        .delete()
        .from(Player)
        .where('"players"."matchId" IN (:...matches)', { matches })
        .execute();
      await conn.getRepository(Match).remove(ch);
    }
  }

  const failedDeletedRes = await conn.createQueryBuilder()
    .select('failed.id').from(Failed, 'failed')
    .where('failed.createdAt <= :old', { old })
    .getMany();
  const failedDeleted = failedDeletedRes.map(n => Number(n.id));
  console.log('failedDeleted', failedDeleted.length);
  if (failedDeleted.length > 0) {
    const chunks = chunk(failedDeleted, 100);
    for (const ch of chunks) {
      await conn.createQueryBuilder()
        .delete()
        .from(Failed)
        .where('id IN (:...ids)', { ids: ch })
        .execute();
    }
  }

  const pickDeleted = await conn.createQueryBuilder()
    .delete()
    .from(Heropick)
    .where('heropicks.date <= :old', { old })
    .execute();
  console.log('Heropick', pickDeleted);
}

loop()
  .then(() => process.exit())
  .catch(e => console.error(e));
