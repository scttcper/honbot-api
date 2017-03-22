import * as ProgressBar from 'progress';

import mongo from '../src/db';
import { getMode, getType } from '../src/mode';
import { findNewest, findOldest } from '../src/scanner';

const PAGE_SIZE = 100;
const update_options = { writeConcern: 0 };

async function loop() {
  const db = await mongo;
  const newest = await findNewest();
  const oldest = await findOldest();
  let cur = oldest.match_id;
  const total = await db.collection('matches').count({ failed: false });
  const bar = new ProgressBar(':bar', { total: total / PAGE_SIZE, width: 100 });
  let count = 0;
  while (cur < newest.match_id) {
    bar.tick();
    const query = { match_id: { $gt: cur }, failed: false };
    const matches = await db.collection('matches').find(query).sort({match_id: 1}).limit(PAGE_SIZE).toArray();
    cur = matches[matches.length - 1].match_id;
    const finished = [];
    for (const match of matches) {
      match.mode = getMode(match);
      match.type = getType(match.mode);
      count++;
      finished.push(db.collection('matches').updateOne({ match_id: match.match_id }, match, update_options));
    }
    await Promise.all(finished);
  }
  console.log(`Updated: ${count}`);
  db.close();
}

loop().then(() => process.exit());
