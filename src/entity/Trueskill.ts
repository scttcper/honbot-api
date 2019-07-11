import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('trueskills')
export class Trueskill {
  @PrimaryColumn() account_id!: number;

  @Column({ type: 'double precision', default: 25 })
  mu!: number;

  @Column({ type: 'double precision', default: 25 / 3 })
  sigma!: number;

  @Column({ default: 1 })
  games!: number;
}
