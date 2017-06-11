import * as debug from 'debug';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';

import { Matches, Players, Failed } from '../models';
import { PlayerAttributes } from '../models/interfaces';
import fetch from './fetch';
import { heroPick } from './heroes';
import { getMode, getType } from './mode';
import { calculatePlayerSkill } from './skill';
import sleep from './sleep';

const log = debug('honbot');
const ITEM_SLOTS = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];

export async function findNewest(): Promise<any> {
  const match = await Matches.findOne({
    order: [['id', 'DESC']],
  });
  if (match) {
    return match.toJSON();
  }
  return undefined;
}

function mapToNumber(obj: any) {
  return _.mapValues(obj, n => {
    const b = Number(n);
    if (_.isNaN(b)) {
      return n;
    }
    return b;
  });
}

export async function parseMultimatch(raw: any, attempted: string[]) {
  raw[0] = raw[0].map((setup: any) => {
    return mapToNumber(setup);
  });
  // put items in array, remove null items
  raw[1] = raw[1].map((items: any) => {
    const r: any = {
      items: [],
      match_id: items.match_id,
      account_id: parseInt(items.account_id, 10),
    };
    ITEM_SLOTS.map(slot => {
      if (items[slot]) {
        r.items.push(parseInt(items[slot], 10));
      }
    });
    return r;
  });
  raw[0] = raw[0].map((n: any) => {
    const x: any = {};
    Object.keys(n).map((k: any) => {
      if (k === 'match_id') {
        x[k] = n[k];
        return;
      }
      x[`setup_${k}`] = n[k];
    });
    return x;
  });
  const matchSetups = _.groupBy(raw[0], _.property('match_id'));
  const matchPlayerItems = _.groupBy(raw[1], _.property('match_id'));
  const matchPlayer = _.groupBy(raw[2], _.property('match_id'));
  const matchInfo = _.groupBy(raw[3], _.property('match_id'));
  const matches = [];
  const failed: number[] = [];
  for (const m of attempted) {
    if (
      !matchSetups[m] ||
      !matchInfo[m] ||
      !matchSetups[m].length ||
      !matchPlayer[m] ||
      !matchPlayer[m].length
    ) {
      log(`failed ${m}`);
      failed.push(parseInt(m, 10));
      continue;
    }
    const match: any = { ...matchSetups[m][0] };
    const info: any = matchInfo[m][0];
    match.id = parseInt(m, 10);
    match.date = moment
      .tz(info.mdt, 'YYYY-MM-DD HH:mm:ss', 'America/Detroit')
      .toDate();
    match.length = parseInt(info.time_played, 10);
    match.version = info.version;
    match.map = info.map;
    match.server_id = parseInt(info.server_id, 10);
    const minutes = moment.duration(match.length, 'seconds').asMinutes();
    const players: any[] = matchPlayer[m] || [];
    match.mode = getMode(match);
    match.type = getType(match.mode);
    match.failed = false;
    match.players = players.map(n => {
      const pl: PlayerAttributes = {};
      pl.account_id = parseInt(n.account_id, 10);
      pl.matchId = parseInt(m, 10);
      pl.nickname = n.nickname;
      // use toLower because for some reason null nicknames
      pl.lowercaseNickname = _.toLower(n.nickname);
      pl.clan_id = parseInt(n.clan_id, 10);
      pl.hero_id = parseInt(n.hero_id, 10);
      pl.position = parseInt(n.position, 10);
      const itemObj = _.find(
        matchPlayerItems[m],
        _.matchesProperty('account_id', pl.account_id),
      );
      pl.items = itemObj ? itemObj.items : [];
      pl.team = parseInt(n.team, 10);
      pl.level = parseInt(n.level, 10);
      pl.win = n.wins === '1';
      pl.concedes = parseInt(n.concedes, 10);
      pl.concedevotes = parseInt(n.concedevotes, 10);
      pl.buybacks = parseInt(n.buybacks, 10);
      pl.discos = parseInt(n.discos, 10);
      pl.kicked = parseInt(n.kicked, 10);
      pl.mmr_change = parseFloat(n.amm_team_rating);
      pl.herodmg = parseInt(n.herodmg, 10);
      pl.kills = parseInt(n.herokills, 10);
      pl.assists = parseInt(n.heroassists, 10);
      pl.deaths = parseInt(n.deaths, 10);
      pl.goldlost2death = parseInt(n.goldlost2death, 10);
      pl.secs_dead = parseInt(n.secs_dead, 10);
      pl.neutralcreepkills = parseInt(n.neutralcreepkills, 10);
      pl.teamcreepkills = parseInt(n.teamcreepkills, 10);
      pl.cs = pl.teamcreepkills + pl.neutralcreepkills;
      pl.bdmg = parseInt(n.bdmg, 10);
      pl.razed = parseInt(n.razed, 10);
      pl.denies = parseInt(n.denies, 10);
      pl.exp_denied = parseInt(n.exp_denied, 10);
      pl.consumables = parseInt(n.consumables, 10);
      pl.wards = parseInt(n.wards, 10);
      pl.bloodlust = parseInt(n.bloodlust, 10);
      pl.doublekill = parseInt(n.doublekill, 10);
      pl.triplekill = parseInt(n.triplekill, 10);
      pl.quadkill = parseInt(n.quadkill, 10);
      pl.annihilation = parseInt(n.annihilation, 10);
      pl.ks3 = parseInt(n.ks3, 10);
      pl.ks4 = parseInt(n.ks4, 10);
      pl.ks5 = parseInt(n.ks5, 10);
      pl.ks6 = parseInt(n.ks6, 10);
      pl.ks7 = parseInt(n.ks7, 10);
      pl.ks8 = parseInt(n.ks8, 10);
      pl.ks9 = parseInt(n.ks9, 10);
      pl.ks10 = parseInt(n.ks10, 10);
      pl.ks15 = parseInt(n.ks15, 10);
      pl.smackdown = parseInt(n.smackdown, 10);
      pl.humiliation = parseInt(n.humiliation, 10);
      pl.nemesis = parseInt(n.nemesis, 10);
      pl.retribution = parseInt(n.retribution, 10);
      pl.used_token = parseInt(n.used_token, 10);
      pl.time_earning_exp = parseInt(n.time_earning_exp, 10);
      pl.teamcreepdmg = parseInt(n.teamcreepdmg, 10);
      pl.teamcreepexp = parseInt(n.teamcreepexp, 10);
      pl.teamcreepgold = parseInt(n.teamcreepgold, 10);
      pl.neutralcreepdmg = parseInt(n.neutralcreepdmg, 10);
      pl.neutralcreepexp = parseInt(n.neutralcreepexp, 10);
      pl.neutralcreepgold = parseInt(n.neutralcreepgold, 10);
      pl.actions = parseInt(n.actions, 10);
      pl.gold = parseInt(n.gold, 10);
      pl.exp = parseInt(n.exp, 10);
      pl.kdr = (!pl.deaths || !pl.kills) ? pl.kills :
        (_.round(pl.kills / pl.deaths, 3) || 0);
      pl.gpm = _.round(pl.gold / minutes, 3) || 0;
      pl.xpm = _.round(pl.exp / minutes, 3) || 0;
      pl.apm = _.round(pl.actions / minutes, 3) || 0;
      return pl;
    });
    if (match.setup_nl + match.setup_officl === 2) {
      await Promise.all([
        calculatePlayerSkill(match.players),
        heroPick(match.players, match.date),
      ]);
    }
    matches.push(match);
  }
  return [matches, failed];
}

export async function grabAndSave(
  matchIds: any[],
  catchFail: boolean = true,
) {
  const res = await fetch(matchIds);
  if ((!res || !res.length) && catchFail) {
    await sleep(100000, 'no results from grab');
    return;
  }
  const [parsed, failed] = await parseMultimatch(res, matchIds);
  if (failed.length === matchIds.length && catchFail) {
    log('25 failed, escaping');
    return;
  }
  if (parsed.length) {
    const pids = parsed.map(n => n.match_id);
    log(`Parsed ${pids.length}`);
    await Matches.bulkCreate(parsed);
    await Players.bulkCreate(_.flatten(parsed.map(n => n.players)));
    await Failed.destroy({ where: { id: { $in: pids }}});
  }
  if (failed.length) {
    const promises = failed
      .map((f => Failed
        .findOrCreate({ where: { id: f } })
        .then(([fail, b]) =>
          fail.increment('attempts'),
        )));
    await Promise.all(promises);
  }
}
