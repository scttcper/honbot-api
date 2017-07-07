import * as debug from 'debug';
import * as _ from 'lodash';
import * as Raven from 'raven';
import { differenceInMinutes, subHours } from 'date-fns';

import { Failed } from '../models';
import config from '../config';
import { findNewest, grabAndSave } from './matches';
import sleep from './sleep';

const log = debug('honbot');

const sentry = Raven
  .config(config.dsn, { autoBreadcrumbs: true })
  .install({ captureUnhandledRejections: true });

// const STARTING_MATCH_ID = 147503112;
const STARTING_MATCH_ID = 149396730;
const BATCH_SIZE = 25;
let notExit = true;

async function findNewMatches() {
  const [newestMatchId, newestMatchDate, diff] = await findNewest().catch((err) => {
    sentry.captureException(err);
  });
  if (diff > 25) {
    await sleep(60000, 'made no forward progress');
  }
  if (newestMatchId) {
    const minutes = differenceInMinutes(new Date(), new Date(newestMatchDate));
    const hours = Math.round(minutes / 60);
    log(`Newest: ${newestMatchId} - Age: ${hours} hours`);
    if (minutes < 180) {
      await sleep(60000, 'matches too recent');
      if (notExit) {
        return findNewMatches().catch((e) => catchError(e));
      }
    }
  }
  const newest = newestMatchId ? newestMatchId : STARTING_MATCH_ID;
  const matchIds = _.range(newest + 1, newest + BATCH_SIZE).map(String);
  log('Finding new matches!');
  await grabAndSave(matchIds, true);
  await sleep(3000, 'findNewMatches sleep');
  if (notExit) {
    return findNewMatches().catch((e) => catchError(e));
  }
}

async function findAllMissing() {
  let cur = 0;
  const hourAgo = subHours(new Date(), 1);
  const missing = await Failed
    .findAll({
      where: {
        id: { $gt: cur },
        attempts: { $lt: 5 },
        updatedAt: { $lt: hourAgo },
      },
      limit: 25,
      order: [['id']],
    });
  if (!missing.length) {
    // wait 30 minutes
    await sleep(1800000, 'no missing found, reset cursor');
    cur = 0;
    if (notExit) {
      return findAllMissing().catch((e) => catchError(e));
    }
  }
  const missingIds = missing.map(x => x.toJSON().id);
  log('Attempting old matches!');
  await grabAndSave(missingIds, false);
  cur = missingIds[missingIds.length - 1];
  await sleep(10000, 'findAllMissing sleeping');
  if (notExit) {
    return findAllMissing().catch((e) => catchError(e));
  }
}

process.on('SIGINT', () => {
  notExit = false;
  setTimeout(() => {
    // 300ms later the process kill it self to allow a restart
    process.exit(0);
  }, 2000);
});

function catchError(err: Error) {
  log(err);
  sentry.captureException(err);
}

if (!module.parent) {
  findNewMatches().catch((e) => catchError(e));
  findAllMissing().catch((e) => catchError(e));
}
