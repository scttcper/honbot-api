import * as debug from 'debug';
import * as request from 'request-promise-native';

import config from '../config';
import sleep from './sleep';

const log = debug('honbot');
const TOKEN = config.token;
const RETRIES = 15;

async function fetch(matchIds: string[] | number[]) {
  if (!matchIds.length) {
    log('Not Enough Matches');
    throw new Error('Not Enough Matches');
  }
  const joined = matchIds.join('+');
  const url = `https://api.heroesofnewerth.com/multi_match/all/matchids/${joined}/?token=${TOKEN}`;
  const options: request.RequestPromiseOptions = {
    gzip: true,
    json: true,
    resolveWithFullResponse: true,
    simple: false,
  };
  log(url);
  for (let i = 0; i < RETRIES; i++) {
    const res: request.FullResponse = await request.get(url, options);
    if (res.statusCode === 200) {
      return res.body;
    }
    if (res.body === 'API User Not Found.') {
      log('WARNING: TOKEN NOT WORKING');
      throw new Error('Misconfigured honbot api token');
    }
    if (res.statusCode === 404 || res.statusCode === 500) {
      // mark all as failed
      return [[], [], []];
    }
    await sleep(1500, `${res.statusCode} from api`);
  }
}

export default fetch;
