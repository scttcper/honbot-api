import * as debug from 'debug';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import * as Raven from 'raven';

import config from '../config';
import mongo from './db';
import { findNewest, grabAndSave } from './matches';
import sleep from './sleep';

const log = debug('honbot');

if (process.env.NODE_ENV !== 'dev') {
  Raven
    .config(config.dsn)
    .install({ captureUnhandledRejections: true });
}

const STARTING_MATCH_ID = 147503111;
const BATCH_SIZE = 25;

async function findNewMatches() {
  let last = 0;
  while (true) {
    const newestMatch = await findNewest();
    if (newestMatch && newestMatch.match_id === last) {
      await sleep(1200000, 'made no forward progress');
    }
    if (newestMatch) {
      log('Newest', newestMatch.match_id);
      const minutes = moment().diff(moment(newestMatch.date), 'minutes');
      const hours = Math.round(minutes / 60);
      log(`Age: ${hours} hours`);
      if (minutes < 140) {
        await sleep(60000, 'matches too recent');
        continue;
      }
    }
    const newest = newestMatch ? newestMatch.match_id : STARTING_MATCH_ID;
    const matchIds = _.range(newest + 1, newest + BATCH_SIZE).map(String);
    log('Finding new matches!');
    await grabAndSave(matchIds, true);
    last = newest;
    await sleep(800, 'findNewMatches sleep');
  }
}

async function findAllMissing() {
  log('finding');
  const db = await mongo;
  let cur = 0;
  while (true) {
    const missing = await db.collection('matches').find({
      match_id: {$gt: cur},
      failed: true,
      attempts: { $lt: 4 } },
      { limit: 25, fields: { match_id: 1 },
    }).sort({ match_id: 1 }).toArray();
    if (!missing.length) {
      // wait 30 minutes
      await sleep(1800000, 'no missing found, reset cursor');
      cur = 0;
      continue;
    }
    const missingIds = missing.map((n) => n.match_id);
    log('Attempting old matches!');
    await grabAndSave(missingIds, false);
    cur = missingIds[missingIds.length - 1];
    await sleep(5000, 'findAllMissing sleeping');
  }
}

if (!module.parent) {
  findNewMatches();
  findAllMissing();
}
