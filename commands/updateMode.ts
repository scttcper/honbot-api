import * as ProgressBar from 'progress';

import mongo from '../src/db';
import { findNewest, findOldest } from '../src/scanner';

async function loop() {
  const db = await mongo;
  await db.collection('trueskill').remove({});
  const newest = await findNewest();
  const oldest = await findOldest();
  let cur = oldest.match_id;
  const bar = new ProgressBar(':bar', { total: newest.match_id - cur, width: 100 });
  while (cur < newest.match_id) {
    bar.tick();
    const query = { match_id: cur };
    const match = await db.collection('matches').findOne(query);
    cur++;
    if (!match || match.failed) {
      continue;
    }
    await db.collection('matches').updateOne(query, match);
  }
  db.close();
}

loop().then(() => process.exit());
