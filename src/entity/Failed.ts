import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fails')
export class Failed {
  @PrimaryColumn() id!: number;

  @Index('fails_attempts')
  @Column()
  attempts!: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
