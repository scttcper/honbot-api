import * as _ from 'lodash';
import * as moment from 'moment';

import mongo from './db';

function addCompetitor(obj, nickname, win) {
  const wl = win ? 'w' : 'l';
  if (!obj[nickname]) {
    obj[nickname] = { t: 0, w: 0, l: 0, nickname };
  }
  obj[nickname][wl] += 1;
  obj[nickname].t += 1;
}

export default async function(lowercaseNickname: string) {
  const query = { 'players.lowercaseNickname': lowercaseNickname };
  const lastWeek = moment().subtract(1, 'week').toDate();
  const db = await mongo;
  const matches = await db.collection('matches').find(query).sort({ match_id: -1 }).toArray();
  const res: any = {};
  const w: any = {};
  const a: any = {};
  res.wins = 0;
  res.losses = 0;
  res.matches = matches.map((m) => {
    const n = _.find(m.players, _.matchesProperty('lowercaseNickname', lowercaseNickname));
    if (moment(m.date).isAfter(lastWeek)) {
      m.players.forEach((p) => {
        if (p.account_id !== n.account_id) {
          const c = p.team === n.team ? w : a;
          addCompetitor(c, p.nickname, n.win);
        }
      });
    }
    res.wins += n.win ? 1 : 0;
    res.losses += n.win ? 0 : 1;
    n.server_id = m.server_id;
    n.setup = m.setup;
    n.date = m.date;
    n.length = m.length;
    n.version = m.version;
    n.c_state = m.c_state;
    n.map = m.map;
    return n;
  });
  res.with = _.filter(w, (z: any) => z.t > 2).sort((c, d) => d.t - c.t);
  res.against = _.filter(a, (z: any) => z.t > 2).sort((c, d) => d.t - c.t);
  return res;
}
