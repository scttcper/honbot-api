import * as debug from 'debug';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import mongo from './db';

import fetch from './fetch';
import { heroPick } from './heroes';
import { IMatchPlayer } from './interfaces';
import { getMode, getType } from './mode';
import { calculatePlayerSkill } from './skill';
import sleep from './sleep';

const log = debug('honbot');
const ITEM_SLOTS = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];

export async function findNewest() {
  const db = await mongo;
  return db
    .collection('matches')
    .findOne(
      { failed : false },
      { sort: { match_id: -1 },
    });
}

export async function findOldest() {
  const db = await mongo;
  return db
    .collection('matches')
    .findOne(
      { failed : false },
      { sort: { match_id: 1 },
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

export function parseMultimatch(raw: any, attempted: string[]) {
  raw[0] = raw[0].map((setup) => {
    return mapToNumber(setup);
  });
  // put items in array, remove null items
  raw[1] = raw[1].map((items) => {
    const r = {
      items: [],
      match_id: items.match_id,
      account_id: parseInt(items.account_id, 10),
    };
    ITEM_SLOTS.map((slot) => {
      if (items[slot]) {
        r.items.push(parseInt(items[slot], 10));
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
    if (!matchSetups[m] || !matchInfo[m] || !matchSetups[m].length || !matchPlayer[m] || !matchPlayer[m].length) {
      log(`failed ${m}`);
      failed.push(parseInt(m, 10));
      continue;
    }
    const info: any = matchInfo[m][0];
    match.match_id = parseInt(m, 10);
    match.setup = matchSetups[m][0];
    match.date = moment.tz(info.mdt, 'YYYY-MM-DD HH:mm:ss', 'America/Detroit').toDate();
    match.length = parseInt(info.time_played, 10);
    match.version = info.version;
    match.map = info.map;
    match.server_id = parseInt(info.server_id, 10);
    match.c_state = parseInt(info.c_state, 10);
    const minutes = moment.duration(match.length, 'seconds').asMinutes();
    const players = matchPlayer[m] || [];
    match.mode = getMode(match);
    match.type = getType(match.mode);
    match.failed = false;
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
      const itemObj = _.find(matchPlayerItems[m], _.matchesProperty('account_id', player.account_id));
      player.items = itemObj ? itemObj.items : [];
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
      player.razed = parseInt(n.razed, 10);
      player.denies = parseInt(n.denies, 10);
      player.exp_denied = parseInt(n.exp_denied, 10);
      player.consumables = parseInt(n.consumables, 10);
      player.wards = parseInt(n.wards, 10);
      player.bloodlust = parseInt(n.bloodlust, 10);
      player.doublekill = parseInt(n.doublekill, 10);
      player.triplekill = parseInt(n.triplekill, 10);
      player.quadkill = parseInt(n.quadkill, 10);
      player.annihilation = parseInt(n.annihilation, 10);
      player.ks3 = parseInt(n.ks3, 10);
      player.ks4 = parseInt(n.ks4, 10);
      player.ks5 = parseInt(n.ks5, 10);
      player.ks6 = parseInt(n.ks6, 10);
      player.ks7 = parseInt(n.ks7, 10);
      player.ks8 = parseInt(n.ks8, 10);
      player.ks9 = parseInt(n.ks9, 10);
      player.ks10 = parseInt(n.ks10, 10);
      player.ks15 = parseInt(n.ks15, 10);
      player.smackdown = parseInt(n.smackdown, 10);
      player.humiliation = parseInt(n.humiliation, 10);
      player.nemesis = parseInt(n.nemesis, 10);
      player.retribution = parseInt(n.retribution, 10);
      player.used_token = parseInt(n.used_token, 10);
      player.time_earning_exp = parseInt(n.time_earning_exp, 10);
      player.teamcreepkills = parseInt(n.teamcreepkills, 10);
      player.teamcreepdmg = parseInt(n.teamcreepdmg, 10);
      player.teamcreepexp = parseInt(n.teamcreepexp, 10);
      player.teamcreepgold = parseInt(n.teamcreepgold, 10);
      player.neutralcreepkills = parseInt(n.neutralcreepkills, 10);
      player.neutralcreepdmg = parseInt(n.neutralcreepdmg, 10);
      player.neutralcreepexp = parseInt(n.neutralcreepexp, 10);
      player.neutralcreepgold = parseInt(n.neutralcreepgold, 10);
      player.actions = parseInt(n.actions, 10);
      player.gold = parseInt(n.gold, 10);
      player.exp = parseInt(n.exp, 10);
      if (!player.deaths || !player.kills) {
        player.kdr = player.kills;
      } else {
        player.kdr = _.round(player.kills / player.deaths, 3) || 0;
      }
      player.gpm = _.round(player.gold / minutes, 3) || 0;
      player.xpm = _.round(player.exp / minutes, 3) || 0;
      player.apm = _.round(player.actions / minutes, 3) || 0;
      return player;
    });
    if (match.setup.nl + match.setup.officl === 2) {
      calculatePlayerSkill(match);
      heroPick(match);
    }
    matches.push(match);
  }
  return [matches, failed];
}

export async function grabAndSave(matchIds: string[], catchFail: boolean = true) {
  const res = await fetch(matchIds);
  if ((!res || !res.length) && catchFail) {
    await sleep(100000, 'no results from grab');
    return;
  }
  const [parsed, failed] = parseMultimatch(res, matchIds);
  if (failed.length === matchIds.length && catchFail) {
    log('25 failed, escaping');
    return;
  }
  const db = await mongo;
  if (parsed.length) {
    const pids = parsed.map((n) => n.match_id);
    log(`Parsed ${pids.length}`);
    await db.collection('matches').remove({ match_id: {$in: pids }});
    await db.collection('matches').insertMany(parsed);
  }
  if (failed.length) {
    for (const f of failed) {
      const fail = { $set: { match_id: f, failed: true }, $inc: { attempts: 1 } };
      await db
        .collection('matches')
        .update({ match_id: f }, fail, { upsert: true });
    }
  }
}
