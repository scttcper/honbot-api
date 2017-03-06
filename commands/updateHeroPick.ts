import * as ProgressBar from 'progress';

import mongo from '../src/db';
import { heroPick } from '../src/heroPick';
import { findNewest, findOldest } from '../src/scanner';

const PAGE_SIZE = 100;

async function loop() {
  const db = await mongo;
  await db.collection('heropicks').remove({});
  const newest = await findNewest();
  const oldest = await findOldest();
  let cur = oldest.match_id;
  const total = await db.collection('matches').count({ failed: { $exists : false } });
  const bar = new ProgressBar(':bar', { total: total / PAGE_SIZE, width: 100 });
  let count = 0;
  while (cur < newest.match_id) {
    bar.tick();
    const query = { match_id: { $gt: cur }, failed: { $exists : false } };
    const matches = await db
      .collection('matches')
      .find(query)
      .sort({match_id: 1})
      .limit(PAGE_SIZE)
      .toArray();
    cur = matches[matches.length - 1].match_id;
    for (const match of matches) {
      if (match.setup.nl + match.setup.officl !== 2) {
        continue;
      }
      count++;
      await heroPick(match);
    }
  }
  console.log(`Updated: ${count}`);
  db.close();
}

loop().then(() => process.exit());
