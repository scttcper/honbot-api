import * as ProgressBar from 'progress';

import mongo from '../src/db';
import { findNewest } from '../src/scanner';
import { calculatePlayerSkill } from '../src/skill';

const PAGE_SIZE = 100;

async function loop() {
  const db = await mongo;
  await db.collection('trueskill').remove({});
  const newest = await findNewest();
  let cur = 147503111;
  const total = await db.collection('matches').count({ failed: { $exists : false } });
  const bar = new ProgressBar(':bar', { total: total / PAGE_SIZE, width: 100 });
  while (cur < newest.match_id) {
    bar.tick();
    const query = { match_id: { $gt: cur }, failed: { $exists : false } };
    const matches = await db.collection('matches').find(query).sort({match_id: 1}).limit(PAGE_SIZE).toArray();
    cur = matches[matches.length - 1].match_id;
    const finished = [];
    for (const match of matches) {
      if (match.setup.nl + match.setup.officl !== 2) {
        continue;
      }
      finished.push(calculatePlayerSkill(match.players, match.match_id));
    }
    await Promise.all(finished);
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
