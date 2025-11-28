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
import { RmmAction } from './rmm-action.entity';

export enum DeviceType {
  WORKSTATION = 'workstation',
  SERVER = 'server',
  LAPTOP = 'laptop',
}

export enum OsType {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
}

export enum RmmPlatform {
  DATTO_RMM = 'datto_rmm',
  NINJA_ONE = 'ninja_one',
  CONNECTWISE = 'connectwise',
}

@Entity('rmm_devices')
export class RmmDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255 })
  deviceName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hostname: string;

  @Column({ name: 'device_type', type: 'varchar', length: 100, nullable: true })
  deviceType: DeviceType;

  @Column({ name: 'os_type', type: 'varchar', length: 100, nullable: true })
  osType: OsType;

  @Column({ name: 'os_version', type: 'varchar', length: 100, nullable: true })
  osVersion: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'mac_address', type: 'varchar', length: 50, nullable: true })
  macAddress: string;

  @Column({ name: 'rmm_platform', type: 'varchar', length: 100, nullable: true })
  rmmPlatform: RmmPlatform;

  @Column({ name: 'external_device_id', type: 'varchar', length: 255, nullable: true })
  externalDeviceId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: DeviceStatus.ONLINE,
  })
  status: DeviceStatus;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.rmmDevices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => RmmAction, (action) => action.rmmDevice)
  rmmActions: RmmAction[];
}
