import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Match } from './Match';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn() id: number;

  @Index('players_account_id')
  @Column()
  account_id: number;

  @Column({ length: 20 })
  nickname: string;

  @Index('players_lowercase_nickname')
  @Column({ length: 20 })
  lowercaseNickname: string;

  @Column() clan_id: number;

  @Column() hero_id: number;

  @Column() position: number;

  @Column({ type: 'int', array: true })
  items: number[];

  @Column() team: number;

  @Column() level: number;

  @Column() win: boolean;

  @Column() concedes: number;

  @Column() concedevotes: number;

  @Column() buybacks: number;

  @Column() discos: number;

  @Column() kicked: number;

  @Column({ type: 'numeric' })
  mmr_change: number;

  @Column() herodmg: number;

  @Column() kills: number;

  @Column() assists: number;

  @Column() deaths: number;

  @Column() goldlost2death: number;

  @Column() secs_dead: number;

  @Column() cs: number;

  @Column() bdmg: number;

  @Column() razed: number;

  @Column() denies: number;

  @Column() exp_denied: number;

  @Column() consumables: number;

  @Column() wards: number;

  @Column() bloodlust: number;

  @Column() doublekill: number;

  @Column() triplekill: number;

  @Column() quadkill: number;

  @Column() annihilation: number;

  @Column() ks3: number;

  @Column() ks4: number;

  @Column() ks5: number;

  @Column() ks6: number;

  @Column() ks7: number;

  @Column() ks8: number;

  @Column() ks9: number;

  @Column() ks10: number;

  @Column() ks15: number;

  @Column() smackdown: number;

  @Column() humiliation: number;

  @Column() nemesis: number;

  @Column() retribution: number;

  @Column() used_token: number;

  @Column() time_earning_exp: number;

  @Column() teamcreepkills: number;

  @Column() teamcreepdmg: number;

  @Column() teamcreepexp: number;

  @Column() teamcreepgold: number;

  @Column() neutralcreepkills: number;

  @Column() neutralcreepdmg: number;

  @Column() neutralcreepexp: number;

  @Column() neutralcreepgold: number;

  @Column() actions: number;

  @Column() gold: number;

  @Column({ type: 'double precision' })
  exp: number;

  @Column({ type: 'double precision' })
  kdr: number;

  @Column({ type: 'double precision' })
  gpm: number;

  @Column({ type: 'double precision' })
  xpm: number;

  @Column({ type: 'double precision' })
  apm: number;

  @Index('players_match_id')
  @ManyToOne(type => Match, match => match.players)
  match: Match;

  @RelationId((player: Player) => player.match)
  matchId: number;
}
