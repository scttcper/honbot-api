import * as debug from 'debug';
import * as request from 'request-promise-native';

import config from '../config';
import sleep from './sleep';

const log = debug('honbot');
const TOKEN = config.token;

export default async function fetch(
  matchIds: string[] | number[],
  attempt = 0,
) {
  if (!matchIds.length) {
    log('Not Enough Matches');
    throw new Error('Not Enough Matches');
  }
  const joined = matchIds.join('+');
  const url = `https://api.heroesofnewerth.com/multi_match/all/matchids/${joined}/?token=${TOKEN}`;
  const options = { gzip: true, json: true };
  log(url);
  let res;
  try {
    res = await request.get(url, options);
  } catch (e) {
    log(e.statusCode);
    if (e.statusCode === 403) {
      log('WARNING: TOKEN NOT WORKING');
      throw new Error('Misconfigured honbot api token');
    }
    if (e.statusCode === 404 || e.statusCode === 500) {
      // mark all as failed
      return [[], [], []];
    }
    if (e.statusCode === 429) {
      await sleep(1000, '429 from api');
    }
    if (attempt < config.retries) {
      return fetch(matchIds, attempt + 1);
    }
  }
  return res;
}
