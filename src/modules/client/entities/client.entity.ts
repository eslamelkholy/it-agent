import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RmmDevice } from '../../rmm/entities/rmm-device.entity';

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ClientStatus.ACTIVE,
  })
  status: ClientStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.client)
  users: User[];

  @OneToMany(() => RmmDevice, (device) => device.client)
  rmmDevices: RmmDevice[];
}
