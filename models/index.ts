import * as Sequelize from 'sequelize';

import config from '../config';

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config.db,
);

export interface MatchAttributes {
  id: number;
  date: Date;
  length: number;
  version: string;
  map: string;
  server_id: number;
  mode: string;
  type: string;
  failed: boolean;
  players: PlayerAttributes[];

  setup_no_repick: number;
  setup_no_agi: number;
  setup_drp_itm: number;
  setup_no_timer: number;
  setup_rev_hs: number;
  setup_no_swap: number;
  setup_no_int: number;
  setup_alt_pick: number;
  setup_veto: number;
  setup_shuf: number;
  setup_no_str: number;
  setup_no_pups: number;
  setup_dup_h: number;
  setup_ap: number;
  setup_br: number;
  setup_em: number;
  setup_cas: number;
  setup_rs: number;
  setup_nl: number;
  setup_officl: number;
  setup_no_stats: number;
  setup_ab: number;
  setup_hardcore: number;
  setup_dev_heroes: number;
  setup_verified_only: number;
  setup_gated: number;
  setup_rapidfire: number;
}

type MatchInstance = Sequelize.Instance<MatchAttributes>;
export const Matches = sequelize.define<MatchInstance, MatchAttributes>('matches', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  date: { type: Sequelize.DATE },
  length: { type: Sequelize.INTEGER },
  version: { type: Sequelize.STRING(12) },
  map: { type: Sequelize.STRING(25) },
  server_id: { type: Sequelize.INTEGER },
  mode: { type: Sequelize.STRING(25) },
  type: { type: Sequelize.STRING(20) },

  setup_no_repick: { type: Sequelize.INTEGER },
  setup_no_agi: { type: Sequelize.INTEGER },
  setup_drp_itm: { type: Sequelize.INTEGER },
  setup_no_timer: { type: Sequelize.INTEGER },
  setup_rev_hs: { type: Sequelize.INTEGER },
  setup_no_swap: { type: Sequelize.INTEGER },
  setup_no_int: { type: Sequelize.INTEGER },
  setup_alt_pick: { type: Sequelize.INTEGER },
  setup_veto: { type: Sequelize.INTEGER },
  setup_shuf: { type: Sequelize.INTEGER },
  setup_no_str: { type: Sequelize.INTEGER },
  setup_no_pups: { type: Sequelize.INTEGER },
  setup_dup_h: { type: Sequelize.INTEGER },
  setup_ap: { type: Sequelize.INTEGER },
  setup_br: { type: Sequelize.INTEGER },
  setup_em: { type: Sequelize.INTEGER },
  setup_cas: { type: Sequelize.INTEGER },
  setup_rs: { type: Sequelize.INTEGER },
  setup_nl: { type: Sequelize.INTEGER },
  setup_officl: { type: Sequelize.INTEGER },
  setup_no_stats: { type: Sequelize.INTEGER },
  setup_ab: { type: Sequelize.INTEGER },
  setup_hardcore: { type: Sequelize.INTEGER },
  setup_dev_heroes: { type: Sequelize.INTEGER },
  setup_verified_only: { type: Sequelize.INTEGER },
  setup_gated: { type: Sequelize.INTEGER },
  setup_rapidfire: { type: Sequelize.INTEGER },
}, {
  updatedAt: false,
});

export interface PlayerAttributes {
  account_id: number;
  matchId: number;
  nickname: string;
  lowercaseNickname: string;
  clan_id: number;
  hero_id: number;
  position: number;
  items: number[];
  team: number;
  level: number;
  win: boolean;
  concedes: number;
  concedevotes: number;
  buybacks: number;
  discos: number;
  kicked: number;
  mmr_change: number;
  herodmg: number;
  kills: number;
  assists: number;
  deaths: number;
  goldlost2death: number;
  secs_dead: number;
  cs: number;
  bdmg: number;
  razed: number;
  denies: number;
  exp_denied: number;
  consumables: number;
  wards: number;
  bloodlust: number;
  doublekill: number;
  triplekill: number;
  quadkill: number;
  annihilation: number;
  ks3: number;
  ks4: number;
  ks5: number;
  ks6: number;
  ks7: number;
  ks8: number;
  ks9: number;
  ks10: number;
  ks15: number;
  smackdown: number;
  humiliation: number;
  nemesis: number;
  retribution: number;
  used_token: number;
  time_earning_exp: number;
  teamcreepkills: number;
  teamcreepdmg: number;
  teamcreepexp: number;
  teamcreepgold: number;
  neutralcreepkills: number;
  neutralcreepdmg: number;
  neutralcreepexp: number;
  neutralcreepgold: number;
  actions: number;
  gold: number;
  exp: number;
  kdr: number;
  gpm: number;
  xpm: number;
  apm: number;
}

type PlayersInstance = Sequelize.Instance<PlayerAttributes>;
export const Players = sequelize.define<PlayersInstance, PlayerAttributes>('players', {
    account_id: { type: Sequelize.INTEGER },
    nickname: { type: Sequelize.STRING(20) },
    lowercaseNickname: { type: Sequelize.STRING(20) },
    clan_id: { type: Sequelize.INTEGER },
    hero_id: { type: Sequelize.INTEGER },
    position: { type: Sequelize.INTEGER },
    items: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
    team: { type: Sequelize.INTEGER },
    level: { type: Sequelize.INTEGER },
    win: { type: Sequelize.BOOLEAN },
    concedes: { type: Sequelize.INTEGER },
    concedevotes: { type: Sequelize.INTEGER },
    buybacks: { type: Sequelize.INTEGER },
    discos: { type: Sequelize.INTEGER },
    kicked: { type: Sequelize.INTEGER },
    mmr_change: { type: Sequelize.DECIMAL },
    herodmg: { type: Sequelize.INTEGER },
    kills: { type: Sequelize.INTEGER },
    assists: { type: Sequelize.INTEGER },
    deaths: { type: Sequelize.INTEGER },
    goldlost2death: { type: Sequelize.INTEGER },
    secs_dead: { type: Sequelize.INTEGER },
    cs: { type: Sequelize.INTEGER },
    bdmg: { type: Sequelize.INTEGER },
    razed: { type: Sequelize.INTEGER },
    denies: { type: Sequelize.INTEGER },
    exp_denied: { type: Sequelize.INTEGER },
    consumables: { type: Sequelize.INTEGER },
    wards: { type: Sequelize.INTEGER },
    bloodlust: { type: Sequelize.INTEGER },
    doublekill: { type: Sequelize.INTEGER },
    triplekill: { type: Sequelize.INTEGER },
    quadkill: { type: Sequelize.INTEGER },
    annihilation: { type: Sequelize.INTEGER },
    ks3: { type: Sequelize.INTEGER },
    ks4: { type: Sequelize.INTEGER },
    ks5: { type: Sequelize.INTEGER },
    ks6: { type: Sequelize.INTEGER },
    ks7: { type: Sequelize.INTEGER },
    ks8: { type: Sequelize.INTEGER },
    ks9: { type: Sequelize.INTEGER },
    ks10: { type: Sequelize.INTEGER },
    ks15: { type: Sequelize.INTEGER },
    smackdown: { type: Sequelize.INTEGER },
    humiliation: { type: Sequelize.INTEGER },
    nemesis: { type: Sequelize.INTEGER },
    retribution: { type: Sequelize.INTEGER },
    used_token: { type: Sequelize.INTEGER },
    time_earning_exp: { type: Sequelize.INTEGER },
    teamcreepkills: { type: Sequelize.INTEGER },
    teamcreepdmg: { type: Sequelize.INTEGER },
    teamcreepexp: { type: Sequelize.INTEGER },
    teamcreepgold: { type: Sequelize.INTEGER },
    neutralcreepkills: { type: Sequelize.INTEGER },
    neutralcreepdmg: { type: Sequelize.INTEGER },
    neutralcreepexp: { type: Sequelize.INTEGER },
    neutralcreepgold: { type: Sequelize.INTEGER },
    actions: { type: Sequelize.INTEGER },
    gold: { type: Sequelize.INTEGER },
    exp: { type: Sequelize.INTEGER },
    kdr: { type: Sequelize.DECIMAL },
    gpm: { type: Sequelize.DECIMAL },
    xpm: { type: Sequelize.DECIMAL },
    apm: { type: Sequelize.DECIMAL },
  }, {
    timestamps: false,
    indexes: [
      { unique: true, fields: ['account_id', 'matchId'] },
      { fields: ['account_id'] },
      { fields: ['lowercaseNickname'] },
      { fields: ['matchId'] },
    ],
  },
);

Players.belongsTo(Matches);
Matches.hasMany(Players);

export interface TrueskillAttributes {
  account_id?: number;
  mu?: number;
  sigma?: number;
  games?: number;
}

type TrueskillInstance = Sequelize.Instance<TrueskillAttributes>;
export const Trueskill = sequelize.define<TrueskillInstance, TrueskillAttributes>('trueskills', {
    account_id: { type: Sequelize.INTEGER, primaryKey: true },
    mu: { type: Sequelize.DECIMAL, defaultValue: 25 },
    sigma: { type: Sequelize.DECIMAL, defaultValue: (25 / 3) },
    games: { type: Sequelize.INTEGER, defaultValue: 1 },
  }, {
    timestamps: false,
  },
);

export interface HeropickAttributes {
  date?: Date;
  hero_id?: number;
  loss?: number;
  win?: number;
}

type HeropickInstance = Sequelize.Instance<HeropickAttributes>;
export const Heropick = sequelize.define<HeropickInstance, HeropickAttributes>('heropicks', {
    date: { type: Sequelize.DATE },
    hero_id: { type: Sequelize.INTEGER },
    loss: { type: Sequelize.INTEGER, defaultValue: 0 },
    win: { type: Sequelize.INTEGER, defaultValue: 0 },
  }, {
    timestamps: false,
    indexes: [
      { unique: true, fields: ['date', 'hero_id'] },
    ],
  },
);

export interface FailedAttributes {
  id?: number;
  attempts?: number;
}

type FailedInstance = Sequelize.Instance<FailedAttributes>;
export const Failed = sequelize.define<FailedInstance, FailedAttributes>('fails', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    attempts: { type: Sequelize.INTEGER },
  }, {
    indexes: [
      { fields: ['attempts'] },
    ],
  },
);
