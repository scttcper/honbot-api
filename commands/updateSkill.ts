import * as ProgressBar from 'progress';

import mongo from '../src/db';
import { findNewest } from '../src/scanner';
import { calculatePlayerSkill } from '../src/skill';

async function loop() {
  const db = await mongo;
  await db.collection('trueskill').remove({});
  const newest = await findNewest();
  let cur = 147503111;
  const bar = new ProgressBar(':bar', { total: newest.match_id - cur, width: 100 });
  while (cur < newest.match_id) {
    bar.tick();
    const current = await db.collection('matches').findOne({ match_id: cur });
    cur++;
    if (!current || current.failed) {
      continue;
    }
    if (current.setup.nl + current.setup.officl !== 2) {
      continue;
    }
    await calculatePlayerSkill(current.players, cur);
  }
  // db.collection('trueskill').aggregate([
  //   { $match: { games: { $gte: 5 } } },
  //   { $project: { mu: { $floor: '$mu' } } },
  //   { $group : { _id : '$mu', count : { $sum : 1 } } },
  //   { $sort: { _id: -1 } },
  // ]);
  db.close();
  process.exit();
}
loop().then();
