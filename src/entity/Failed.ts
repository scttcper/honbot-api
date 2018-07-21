import { Entity, Column, Index, PrimaryColumn } from 'typeorm';

@Entity('fails')
export class Failed {
  @PrimaryColumn() id: number;

  @Index('fails_attempts')
  @Column()
  attempts: number;
}
