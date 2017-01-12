import config from '../config';
import mongo from './db';
import { findNewest } from './scanner';

async function loop() {
  const newest = await findNewest();
  const db = await mongo;
  let cur = 147503111;
  while (cur <= newest.match_id) {
    const current = db.collection('matches').findOne({match_id: cur});
    cur++;
    if (!current) {
      const fail = { $set: { match_id: cur, failed: true }, $inc: { attempts: 1 } };
      await db.collection('matches').update({ match_id: cur }, fail, { upsert: true });
    }
  }
}
loop().then();
