import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Family } from '../families/family.entity';

export enum UserRole {
  GUARDIAN = 'guardian',
  LEARNER = 'learner',
  SUPERUSER = 'superuser',
  SYSTEM = 'system',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.LEARNER,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'family_id' })
  familyId: string;

  @ManyToOne(() => Family, (family) => family.members)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @Column({ name: 'keycloak_id', unique: true })
  keycloakId: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;
}
