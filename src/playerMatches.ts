import { subDays } from 'date-fns';
import * as _ from 'lodash';
import { In } from 'typeorm';

import { getConnection } from './db';
import { Match } from './entity/Match';
import { Player } from './entity/Player';

function addCompetitor(obj, nickname, win) {
  const wl = win ? 'w' : 'l';
  if (!obj[nickname]) {
    obj[nickname] = { t: 0, w: 0, l: 0, nickname };
  }
  obj[nickname][wl] += 1;
  obj[nickname].t += 1;
}

export async function playerCompetition(lowercaseNickname: string) {
  const oneWeekAgo = subDays(new Date(), 7);
  const conn = await getConnection();
  const matchIds = await conn
    .createQueryBuilder()
    .select(['match.id'])
    .from(Player, 'players')
    .innerJoin('players.match', 'match')
    .where('players.lowercaseNickname = :lowercaseNickname', {
      lowercaseNickname,
    })
    .andWhere('match.date > :oneWeekAgo', { oneWeekAgo })
    .execute();
  const ids: number[] = matchIds.map(n => n.match_id);
  const matches = await conn.getRepository(Match).find({ id: In(ids) });
  const w: any = {};
  const a: any = {};
  ids.forEach(m => {
    // other players in match
    const p = _.find(matches, _.matchesProperty('id', m)).players;
    // player itself
    const n = _.find(
      p,
      _.matchesProperty('lowercaseNickname', lowercaseNickname),
    );
    p.forEach(x => {
      if (x.lowercaseNickname === n.lowercaseNickname) {
        return;
      }
      addCompetitor(x.team === n.team ? w : a, x.nickname, n.win);
    });
  });
  const res = { with: [], against: [] };
  // removes players with less than 2 co-matches and sorts
  res.with = _.filter(w, (z: any) => z.t > 2).sort((c, d) => d.t - c.t);
  res.against = _.filter(a, (z: any) => z.t > 2).sort((c, d) => d.t - c.t);
  return res;
}

export async function playerMatches(lowercaseNickname: string) {
  const conn = await getConnection();
  const matches = await conn
    .createQueryBuilder()
    .select('match')
    .from(Match, 'match')
    .innerJoinAndSelect('match.players', 'players')
    .where('players.lowercaseNickname = :lowercaseNickname', {
      lowercaseNickname,
    })
    .orderBy('match.id', 'DESC')
    .getMany();

  const res: any = {
    wins: 0,
    losses: 0,
    matches: [],
    account_id: matches.length ? matches[0].players[0].account_id : 0,
  };
  res.matches = matches.map(m => {
    const n: any = m.players[0];
    res.wins += n.win ? 1 : 0;
    res.losses += n.win ? 0 : 1;
    n.server_id = m.server_id;
    n.setup_no_repick = m.setup_no_repick;
    n.setup_no_agi = m.setup_no_agi;
    n.setup_drp_itm = m.setup_drp_itm;
    n.setup_no_timer = m.setup_no_timer;
    n.setup_rev_hs = m.setup_rev_hs;
    n.setup_no_swap = m.setup_no_swap;
    n.setup_no_int = m.setup_no_int;
    n.setup_alt_pick = m.setup_alt_pick;
    n.setup_veto = m.setup_veto;
    n.setup_shuf = m.setup_shuf;
    n.setup_no_str = m.setup_no_str;
    n.setup_no_pups = m.setup_no_pups;
    n.setup_dup_h = m.setup_dup_h;
    n.setup_ap = m.setup_ap;
    n.setup_br = m.setup_br;
    n.setup_em = m.setup_em;
    n.setup_cas = m.setup_cas;
    n.setup_rs = m.setup_rs;
    n.setup_nl = m.setup_nl;
    n.setup_officl = m.setup_officl;
    n.setup_no_stats = m.setup_no_stats;
    n.setup_ab = m.setup_ab;
    n.setup_hardcore = m.setup_hardcore;
    n.setup_dev_heroes = m.setup_dev_heroes;
    n.setup_verified_only = m.setup_verified_only;
    n.setup_gated = m.setup_gated;
    n.setup_rapidfire = m.setup_rapidfire;
    n.date = m.date;
    n.length = m.length;
    n.version = m.version;
    n.map = m.map;
    n.type = m.type;
    n.mode = m.mode;
    return n;
  });
  return res;
}
