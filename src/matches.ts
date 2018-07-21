import * as debug from 'debug';
import * as _ from 'lodash';

import { Match } from './entity/Match';
import { Failed } from './entity/Failed';
import fetch from './fetch';
import { heroPick } from './heroes';
import { getMode, getType } from './mode';
import { calculatePlayerSkill } from './skill';
import sleep from './sleep';
import { getConnection } from './db';
import { Player } from './entity/Player';

const log = debug('honbot');
const ITEM_SLOTS = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];

export async function findNewest(): Promise<any> {
  const conn = await getConnection();
  const match = await conn
    .getRepository(Match)
    .findOne({ order: { id: 'DESC' } });
  const failed = await conn
    .getRepository(Failed)
    .findOne({ order: { id: 'DESC' } });
  if (!match && !failed) {
    return [undefined, undefined, 0];
  }
  const m = Number(match.id || 0);
  const f = Number(failed.id || 0);
  if (m > f) {
    return [match.id, match.date, f - m];
  }
  return [failed.id, match.date, f - m];
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

export async function parseMultimatch(
  raw: any,
  attempted: string[],
): Promise<[Match[], Player[][], number[]]> {
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
  const matches: Match[] = [];
  const players: Player[][] = [];
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
    const match = new Match();
    match.setup_no_repick = matchSetups[m][0].setup_no_repick;
    match.setup_no_agi = matchSetups[m][0].setup_no_agi;
    match.setup_drp_itm = matchSetups[m][0].setup_drp_itm;
    match.setup_no_timer = matchSetups[m][0].setup_no_timer;
    match.setup_rev_hs = matchSetups[m][0].setup_rev_hs;
    match.setup_no_swap = matchSetups[m][0].setup_no_swap;
    match.setup_no_int = matchSetups[m][0].setup_no_int;
    match.setup_alt_pick = matchSetups[m][0].setup_alt_pick;
    match.setup_veto = matchSetups[m][0].setup_veto;
    match.setup_shuf = matchSetups[m][0].setup_shuf;
    match.setup_no_str = matchSetups[m][0].setup_no_str;
    match.setup_no_pups = matchSetups[m][0].setup_no_pups;
    match.setup_dup_h = matchSetups[m][0].setup_dup_h;
    match.setup_ap = matchSetups[m][0].setup_ap;
    match.setup_br = matchSetups[m][0].setup_br;
    match.setup_em = matchSetups[m][0].setup_em;
    match.setup_cas = matchSetups[m][0].setup_cas;
    match.setup_rs = matchSetups[m][0].setup_rs;
    match.setup_nl = matchSetups[m][0].setup_nl;
    match.setup_officl = matchSetups[m][0].setup_officl;
    match.setup_no_stats = matchSetups[m][0].setup_no_stats;
    match.setup_ab = matchSetups[m][0].setup_ab;
    match.setup_hardcore = matchSetups[m][0].setup_hardcore;
    match.setup_dev_heroes = matchSetups[m][0].setup_dev_heroes;
    match.setup_verified_only = matchSetups[m][0].setup_verified_only;
    match.setup_gated = matchSetups[m][0].setup_gated;
    match.setup_rapidfire = matchSetups[m][0].setup_rapidfire;
    const info: any = matchInfo[m][0];
    match.id = parseInt(m, 10);
    match.date = new Date(`${info.mdt}-05:00`);
    match.length = parseInt(info.time_played, 10);
    match.version = info.version;
    match.map = info.map;
    match.server_id = parseInt(info.server_id, 10);
    const minutes = match.length / 60;
    const pls: any[] = matchPlayer[m] || [];
    match.mode = getMode(match);
    match.type = getType(match.mode);
    const mplayers = pls.map(n => {
      const pl = new Player();
      pl.account_id = parseInt(n.account_id, 10);
      pl.match = match;
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
      pl.kdr =
        !pl.deaths || !pl.kills
          ? pl.kills
          : _.round(pl.kills / pl.deaths, 3) || 0;
      pl.gpm = _.round(pl.gold / minutes, 3) || 0;
      pl.xpm = _.round(pl.exp / minutes, 3) || 0;
      pl.apm = _.round(pl.actions / minutes, 3) || 0;
      return pl;
    });
    players.push(mplayers);
    if (match.setup_nl + match.setup_officl === 2) {
      await Promise.all([
        calculatePlayerSkill(mplayers),
        heroPick(mplayers, match.date),
      ]);
    }
    matches.push(match);
  }
  return [matches, players, failed];
}

export async function grabAndSave(matchIds: any[], catchFail: boolean = true) {
  const res = await fetch(matchIds);
  if ((!res || !res.length) && catchFail) {
    await sleep(100000, 'no results from grab');
    return;
  }
  const [matches, players, failed] = await parseMultimatch(res, matchIds);
  // if (failed.length === matchIds.length && catchFail) {
  //   log('25 failed, escaping');
  //   return;
  // }
  const conn = await getConnection();
  if (matches.length) {
    const pids = matches.map(n => n.id);
    console.log(pids);
    log(`Parsed ${pids.length}`);
    await conn
      .createQueryBuilder()
      .insert()
      .into(Match)
      .values(matches)
      .execute();
    const pl = _.flatten(players);
    await conn
      .createQueryBuilder()
      .insert()
      .into(Player)
      .values(pl)
      .execute();
    await conn.getRepository(Failed).delete(pids);
  }
  if (failed.length) {
    const promises = failed.map(async f => {
      const fail = await conn.getRepository(Failed).findOne({ id: f });
      if (fail) {
        return conn.getRepository(Failed).increment(fail, 'attempts', 1);
      }
      const newFail = new Failed();
      newFail.id = f;
      return conn.getRepository(Failed).insert(newFail);
    });
    await Promise.all(promises);
  }
}
