import * as debug from 'debug';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import * as Raven from 'raven';

import { Failed } from '../models';
import config from '../config';
import { findNewest, grabAndSave } from './matches';
import sleep from './sleep';

const log = debug('honbot');

const sentry = Raven
  .config(config.dsn, { autoBreadcrumbs: true })
  .install({ captureUnhandledRejections: true });

const STARTING_MATCH_ID = 149396730;
const BATCH_SIZE = 25;

async function findNewMatches() {
  let last = 0;
  while (true) {
    const newestMatch = await findNewest().catch((err) => {
      sentry.captureException(err);
    });
    if (newestMatch && newestMatch.id === last) {
      await sleep(60000, 'made no forward progress');
    }
    if (newestMatch) {
      log('Newest', newestMatch.id);
      const minutes = moment().diff(moment(newestMatch.date), 'minutes');
      const hours = Math.round(minutes / 60);
      log(`Age: ${hours} hours`);
      if (minutes < 140) {
        await sleep(60000, 'matches too recent');
        continue;
      }
    }
    const newest = newestMatch ? newestMatch.id : STARTING_MATCH_ID;
    const matchIds = _.range(newest + 1, newest + BATCH_SIZE).map(String);
    log('Finding new matches!');
    await grabAndSave(matchIds, true);
    last = newest;
    await sleep(3000, 'findNewMatches sleep');
  }
}

async function findAllMissing() {
  log('finding');
  let cur = 0;
  const hourAgo = moment().subtract(1, 'hour').toDate();
  while (true) {
    const missing = await Failed
      .findAll({
        where: {
          id: { $gt: cur },
          attempts: { $lt: 4 },
          updatedAt: { $lt: hourAgo },
        },
        limit: 25,
        order: 'id',
      });
    if (!missing.length) {
      // wait 30 minutes
      await sleep(1800000, 'no missing found, reset cursor');
      cur = 0;
      continue;
    }
    const missingIds = missing.map(x => x.toJSON().id);
    log('Attempting old matches!');
    await grabAndSave(missingIds, false);
    cur = missingIds[missingIds.length - 1];
    await sleep(10000, 'findAllMissing sleeping');
  }
}

if (!module.parent) {
  findNewMatches();
  findAllMissing();
}
