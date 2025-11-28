import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RmmDevice } from './rmm-device.entity';
import { User } from '../../user/entities/user.entity';

export enum ActionType {
  RESTART = 'restart',
  PASSWORD_RESET = 'password_reset',
  SCRIPT_EXECUTION = 'script_execution',
  SOFTWARE_INSTALL = 'software_install',
  BACKUP_CHECK = 'backup_check',
  SYSTEM_RESTART = 'system_restart',
}

export enum ActionStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('rmm_actions')
export class RmmAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rmm_device_id', type: 'uuid' })
  rmmDeviceId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'action_type', type: 'varchar', length: 100 })
  actionType: ActionType;

  @Column({ name: 'action_name', type: 'varchar', length: 255, nullable: true })
  actionName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  status: ActionStatus;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'result_data', type: 'jsonb', nullable: true })
  resultData: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RmmDevice, (device) => device.rmmActions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rmm_device_id' })
  rmmDevice: RmmDevice;

  @ManyToOne(() => User, (user) => user.rmmActions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
