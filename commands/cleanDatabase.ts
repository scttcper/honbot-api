import { subDays } from 'date-fns';
import { In } from 'typeorm';

import { getConnection } from '../src/db';
import { Failed } from '../src/entity/Failed';
import { Heropick } from '../src/entity/Heropick';
import { Match } from '../src/entity/Match';

async function loop() {
  const old = subDays(new Date(), 120);
  const conn = await getConnection();
  const unrankedDeleted = await conn.createQueryBuilder()
    .select('match.id').from(Match, 'match')
    .where('match.createdAt <= :old', { old })
    .andWhere('match.mode = :mode', { mode: 'Unknown' })
    .getMany();
  console.log('unranked', unrankedDeleted.length);
  if (unrankedDeleted.length > 0) {
    await conn.getRepository(Match).remove(unrankedDeleted);
  }

  const failedDeletedRes = await conn.createQueryBuilder()
    .select('failed.id').from(Failed, 'failed')
    .where('failed.createdAt <= :old', { old })
    .getMany();
  const failedDeleted = failedDeletedRes.map(n => Number(n.id));
  console.log('failedDeleted', failedDeleted.length);
  if (failedDeleted.length > 0) {
    await conn.createQueryBuilder()
      .delete()
      .from(Failed)
      .where('id IN (:...ids)', { ids: failedDeleted })
      .execute();
  }

  const pickDeleted = await conn.createQueryBuilder()
    .select('heropick.id').from(Heropick, 'heropick')
    .where('heropick.date <= :old', { old })
    .getMany();
  console.log('Heropick', pickDeleted.length);
  if (pickDeleted.length > 0) {
    await conn.getRepository(Heropick).remove(pickDeleted);
  }
}

loop()
  .then(() => process.exit())
  .catch(e => console.error(e));
