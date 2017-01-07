import * as debug from 'debug';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import * as request from 'request-promise-native';

import config from '../config';
import mongo from './db';
import { IMatches, IMatchInfo, IMatchPlayer, IMatchPlayerItems, IMatchSetup  } from './matches';

const log = debug('honbot');

const STARTING_MATCH_ID = 147503111;
// const STARTING_MATCH_ID = 7503111;
const BATCH_SIZE = 25;
const TOKEN = config.token;
const ITEM_SLOTS = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];

function sleep(duration) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve(0); }, duration);
  });
}

function mapToNumber(obj) {
  return _.mapValues(obj, (n) => {
    const b = Number(n);
    if (_.isNaN(b)) {
      return n;
    }
    return b;
  });
}

async function fetch(matchIds: string[], attempt = 0) {
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
      // TODO: abandon hope of these matches or something
    }
    if (attempt < config.retries) {
      await sleep(500);
      return fetch(matchIds, attempt + 1);
    }
  }
  return res;
}

function parse(raw: any, attempted: string[]) {
  raw[0] = raw[0].map((setup) => {
    return mapToNumber(setup);
  });
  // put items in array, remove null items
  raw[1] = raw[1].map((items) => {
    const r = {
      items: [],
      match_id: items.match_id,
      account_id: items.account_id,
    };
    ITEM_SLOTS.map((slot) => {
      if (items[slot]) {
        r.items.push(items[slot]);
      }
    });
    return r;
  });
  const matchSetups = _.groupBy(raw[0], _.property('match_id'));
  const matchPlayerItems = _.groupBy(raw[1], _.property('match_id'));
  const matchPlayer = _.groupBy(raw[2], _.property('match_id'));
  const matchInfo = _.groupBy(raw[3], _.property('match_id'));
  const matches = [];
  const failed: number[] = [];
  for (const m of attempted) {
    const match: any = {};
    if (!matchSetups[m] || !matchInfo[m]) {
      log(`failed ${m}`);
      failed.push(parseInt(m, 10));
      continue;
    }
    const info: any = matchInfo[m][0];
    match.match_id = parseInt(m, 10);
    match.setup = matchSetups[m][0];
    match.date = moment.tz(info.mdt, 'YYYY-MM-DD HH:mm:ss', 'America/Detroit').toDate();
    match.length = parseInt(info.time_played, 10);
    const minutes = moment.duration(match.length, 'seconds').asMinutes();
    const players = matchPlayer[m] || [];
    match.players = players.map((n: IMatchPlayer) => {
      const player: any = {};
      player.account_id = parseInt(n.account_id, 10);
      player.match_id = parseInt(m, 10);
      player.nickname = n.nickname;
      // use toLower because for some reason null nicknames
      player.lowercaseNickname = _.toLower(n.nickname);
      player.clan_id = parseInt(n.clan_id, 10);
      player.hero_id = parseInt(n.hero_id, 10);
      player.position = parseInt(n.position, 10);
      player.items = _.find(matchPlayerItems[m], _.matchesProperty('account_id', player.player_id)) || [];
      player.team = parseInt(n.team, 10);
      player.level = parseInt(n.level, 10);
      player.win = n.wins === '1';
      player.concedes = parseInt(n.concedes, 10);
      player.concedevotes = parseInt(n.concedevotes, 10);
      player.buybacks = parseInt(n.buybacks, 10);
      player.discos = parseInt(n.discos, 10);
      player.kicked = parseInt(n.kicked, 10);
      player.mmr_change = parseFloat(n.amm_team_rating);
      player.herodmg = parseInt(n.herodmg, 10);
      player.kills = parseInt(n.herokills, 10);
      player.assists = parseInt(n.heroassists, 10);
      player.deaths = parseInt(n.deaths, 10);
      player.goldlost2death = parseInt(n.goldlost2death, 10);
      player.secs_dead = parseInt(n.secs_dead, 10);
      player.cs = parseInt(n.teamcreepkills, 10) + parseInt(n.neutralcreepkills, 10);
      player.bdmg = parseInt(n.bdmg, 10);
      player.denies = parseInt(n.denies, 10);
      player.exp_denied = parseInt(n.exp_denied, 10);
      player.consumables = parseInt(n.consumables, 10);
      player.wards = parseInt(n.wards, 10);
      if (!player.deaths || !player.kills) {
        player.kdr = player.kills;
      } else {
        player.kdr = _.round(player.kills / player.deaths, 3) || 0;
      }
      player.gpm = _.round(parseInt(n.gold, 10) / minutes, 3) || 0;
      player.xpm = _.round(parseInt(n.exp, 10) / minutes, 3) || 0;
      player.apm = _.round(parseInt(n.actions, 10) / minutes, 3) || 0;
      return player;
    });
    matches.push(match);
  }
  return [matches, failed];
}

async function scan(startingId: number) {
  if (!startingId) {
    log('startingId required');
    throw new Error('startingId required');
  }
  const matchIds = _.range(startingId, startingId + 25).map(String);
  // convert matchSetups to numbers
  let res;
  try {
    res = await fetch(matchIds);
  } catch (e) {
    // TODO: wait longer
    log('Fetch Failed');
    return;
  }
  const [parsed, failed] = parse(res, matchIds);
  if (failed.length === 25) {
    await sleep(600000);
  }
  const db = await mongo;
  const inserted = await db.collection('matches').insertMany(parsed);
}

async function findNewest() {
  const db = await mongo;
  const newest = await db.collection('matches').findOne({}, {
    fields: { match_id: 1, _id: 0 },
    sort: { match_id: -1 },
  });
  if (newest === null) {
    log('Starting from STARTING_MATCH_ID');
    return STARTING_MATCH_ID;
  }
  // TODO: check time. not too fresh
  return newest.match_id;
}

async function loop() {
  let newest = STARTING_MATCH_ID;
  while (newest <= 147902889) {
    newest = await findNewest();
    const status = await scan(newest + 1);
    await sleep(1000);
  }
}
loop().then();
