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
import { RmmDevice } from '../../rmm/entities/rmm-device.entity';
import { User } from '../../user/entities/user.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { KnowledgeBase } from '../../rag/entities/knowledge-base.entity';

export enum TicketStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ name: 'rmm_device_id', type: 'uuid', nullable: true })
  rmmDeviceId: string;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: TicketStatus.NEW,
  })
  status: TicketStatus;

  @Column({
    type: 'varchar',
    length: 50,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({ name: 'external_ticket_id', type: 'varchar', length: 255, nullable: true })
  externalTicketId: string;

  @Column({ name: 'resolution_steps', type: 'text', nullable: true })
  resolutionSteps: string;

  @Column({ name: 'knowledge_base_article_id', type: 'uuid', nullable: true })
  knowledgeBaseArticleId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => RmmDevice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rmm_device_id' })
  rmmDevice: RmmDevice;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'knowledge_base_article_id' })
  knowledgeBaseArticle: KnowledgeBase;

  @OneToMany(() => TicketAttachment, (attachment) => attachment.ticket)
  attachments: TicketAttachment[];
}
