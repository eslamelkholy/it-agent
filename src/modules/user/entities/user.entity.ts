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
import { Client } from '../../client/entities/client.entity';
import { RmmAction } from '../../rmm/entities/rmm-action.entity';

export enum UserRole {
  ADMIN = 'admin',
  ENGINEER_L1 = 'engineer_l1',
  ENGINEER_L2 = 'engineer_l2',
  ENGINEER_L3 = 'engineer_l3',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 50 })
  role: UserRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => RmmAction, (action) => action.user)
  rmmActions: RmmAction[];
}
