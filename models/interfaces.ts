export interface MatchAttributes {
  id?: number;
  date?: Date;
  length?: number;
  version?: string;
  map?: string;
  server_id?: number;
  mode?: string;
  type?: string;
  players?: PlayerAttributes[];

  setup_no_repick?: number;
  setup_no_agi?: number;
  setup_drp_itm?: number;
  setup_no_timer?: number;
  setup_rev_hs?: number;
  setup_no_swap?: number;
  setup_no_int?: number;
  setup_alt_pick?: number;
  setup_veto?: number;
  setup_shuf?: number;
  setup_no_str?: number;
  setup_no_pups?: number;
  setup_dup_h?: number;
  setup_ap?: number;
  setup_br?: number;
  setup_em?: number;
  setup_cas?: number;
  setup_rs?: number;
  setup_nl?: number;
  setup_officl?: number;
  setup_no_stats?: number;
  setup_ab?: number;
  setup_hardcore?: number;
  setup_dev_heroes?: number;
  setup_verified_only?: number;
  setup_gated?: number;
  setup_rapidfire?: number;

  createdAt?: Date;
}

export interface PlayerAttributes {
  account_id?: number;
  matchId?: number;
  nickname?: string;
  lowercaseNickname?: string;
  clan_id?: number;
  hero_id?: number;
  position?: number;
  items?: number[];
  team?: number;
  level?: number;
  win?: boolean;
  concedes?: number;
  concedevotes?: number;
  buybacks?: number;
  discos?: number;
  kicked?: number;
  mmr_change?: number;
  herodmg?: number;
  kills?: number;
  assists?: number;
  deaths?: number;
  goldlost2death?: number;
  secs_dead?: number;
  cs?: number;
  bdmg?: number;
  razed?: number;
  denies?: number;
  exp_denied?: number;
  consumables?: number;
  wards?: number;
  bloodlust?: number;
  doublekill?: number;
  triplekill?: number;
  quadkill?: number;
  annihilation?: number;
  ks3?: number;
  ks4?: number;
  ks5?: number;
  ks6?: number;
  ks7?: number;
  ks8?: number;
  ks9?: number;
  ks10?: number;
  ks15?: number;
  smackdown?: number;
  humiliation?: number;
  nemesis?: number;
  retribution?: number;
  used_token?: number;
  time_earning_exp?: number;
  teamcreepkills?: number;
  teamcreepdmg?: number;
  teamcreepexp?: number;
  teamcreepgold?: number;
  neutralcreepkills?: number;
  neutralcreepdmg?: number;
  neutralcreepexp?: number;
  neutralcreepgold?: number;
  actions?: number;
  gold?: number;
  exp?: number;
  kdr?: number;
  gpm?: number;
  xpm?: number;
  apm?: number;
}

export interface TrueskillAttributes {
  account_id?: number;
  mu?: number;
  sigma?: number;
  games?: number;
}

export interface HeropickAttributes {
  date?: Date;
  hero_id?: number;
  loss?: number;
  win?: number;
}

export interface FailedAttributes {
  id?: number;
  attempts?: number;
  createdAt: Date;
  updatedAt: Date;
}
