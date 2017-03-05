import * as moment from 'moment';

import mongo from './db';

export async function heroPick(match: any) {
  const db = await mongo;
  const date = moment(match.date).startOf('day').toDate();
  const updates = [];
  for (const p of match.players) {
    const query: any = {
      date,
      hero_id: p.hero_id,
    };
    const update: any = { $inc: { } };
    if (p.win) {
      update.$inc.win = 1;
    } else {
      update.$inc.loss = 1;
    }
    const up = db.collection('heropicks').updateOne(query, update, { upsert: true });
    updates.push(up);
  }
  await Promise.all(updates);
}
