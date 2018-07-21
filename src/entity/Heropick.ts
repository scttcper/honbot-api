import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('heropicks')
@Index('heropicks_date_hero_id_key', ['date', 'hero_id'], { unique: true })
export class Heropick {
  @PrimaryGeneratedColumn() id: number;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Index('heropicks_date')
  @Column()
  hero_id: number;

  @Column() loss: number;

  @Column() win: number;
}
