import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Player } from './Player';

@Entity('matches')
export class Match {
  @PrimaryColumn() id: number;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column() length: number;

  @Column({ length: 12 })
  version: string;

  @Column({ length: 25 })
  map: string;

  @Column() server_id: number;

  @Column({ length: 25 })
  mode: string;

  @Column({ length: 20 })
  type: string;

  @Column() setup_no_repick: number;
  @Column() setup_no_agi: number;
  @Column() setup_drp_itm: number;
  @Column() setup_no_timer: number;
  @Column() setup_rev_hs: number;
  @Column() setup_no_swap: number;
  @Column() setup_no_int: number;
  @Column() setup_alt_pick: number;
  @Column() setup_veto: number;
  @Column() setup_shuf: number;
  @Column() setup_no_str: number;
  @Column() setup_no_pups: number;
  @Column() setup_dup_h: number;
  @Column() setup_ap: number;
  @Column() setup_br: number;
  @Column() setup_em: number;
  @Column() setup_cas: number;
  @Column() setup_rs: number;
  @Column() setup_nl: number;
  @Column() setup_officl: number;
  @Column() setup_no_stats: number;
  @Column() setup_ab: number;
  @Column() setup_hardcore: number;
  @Column() setup_dev_heroes: number;
  @Column() setup_verified_only: number;
  @Column() setup_gated: number;
  @Column() setup_rapidfire: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(type => Player, player => player.match, {
    eager: true,
  })
  @JoinTable()
  players: Player[];
}
