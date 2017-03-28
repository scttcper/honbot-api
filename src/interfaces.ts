
export interface IMatches {
  [index: string]: [IMatchSetup[], IMatchPlayerItems[], IMatchPlayer[], IMatchInfo[]];
}

export interface IMatchSetup {
  match_id: string;
  no_repick: string;
  no_agi: string;
  drp_itm: string;
  no_timer: string;
  rev_hs: string;
  no_swap: string;
  no_int: string;
  alt_pick: string;
  veto: string;
  shuf: string;
  no_str: string;
  no_pups: string;
  dup_h: string;
  ap: string;
  br: string;
  em: string;
  cas: string;
  rs: string;
  nl: string;
  officl: string;
  no_stats: string;
  ab: string;
  hardcore: string;
  dev_heroes: string;
  verified_only: string;
  gated: string;
  rapidfire: string;
}

export interface IMatchPlayerItems {
  account_id: string;
  match_id: string;
  slot_1?: string;
  slot_2?: string;
  slot_3?: string;
  slot_4?: string;
  slot_5?: string;
  slot_6?: string;
  nickname: string;
}

export interface IMatchPlayer {
  match_id: string;
  account_id: string;
  clan_id: string;
  hero_id: string;
  position: string;
  team: string;
  level: string;
  wins: string;
  losses: string;
  concedes: string;
  concedevotes: string;
  buybacks: string;
  discos: string;
  kicked: string;
  pub_skill: string;
  pub_count: string;
  amm_solo_rating: string;
  amm_solo_count: string;
  amm_team_rating: string;
  amm_team_count: string;
  avg_score: string;
  herokills: string;
  herodmg: string;
  heroexp: string;
  herokillsgold: string;
  heroassists: string;
  deaths: string;
  goldlost2death: string;
  secs_dead: string;
  teamcreepkills: string;
  teamcreepdmg: string;
  teamcreepexp: string;
  teamcreepgold: string;
  neutralcreepkills: string;
  neutralcreepdmg: string;
  neutralcreepexp: string;
  neutralcreepgold: string;
  bdmg: string;
  bdmgexp: string;
  razed: string;
  bgold: string;
  denies: string;
  exp_denied: string;
  gold: string;
  gold_spent: string;
  exp: string;
  actions: string;
  secs: string;
  consumables: string;
  wards: string;
  time_earning_exp: string;
  bloodlust: string;
  doublekill: string;
  triplekill: string;
  quadkill: string;
  annihilation: string;
  ks3: string;
  ks4: string;
  ks5: string;
  ks6: string;
  ks7: string;
  ks8: string;
  ks9: string;
  ks10: string;
  ks15: string;
  smackdown: string;
  humiliation: string;
  nemesis: string;
  retribution: string;
  used_token: string;
  nickname: string;
}

export interface IMatchInfo {
  match_id: string;
  server_id: string;
  map: string;
  time_played: string;
  c_state: string;
  version: string;
  mdt: string;
  replay_url: string;
}
