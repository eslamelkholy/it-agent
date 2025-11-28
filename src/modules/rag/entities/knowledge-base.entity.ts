import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum KnowledgeCategory {
  PASSWORD_RESET = 'password_reset',
  SYSTEM_RESTART = 'system_restart',
  BACKUP_FAILURE = 'backup_failure',
  ACCESS_REQUEST = 'access_request',
  SOFTWARE_INSTALL = 'software_install',
  NETWORK_ISSUE = 'network_issue',
  EMAIL_ISSUE = 'email_issue',
  HARDWARE_ISSUE = 'hardware_issue',
  VPN_ISSUE = 'vpn_issue',
  PERFORMANCE_ISSUE = 'performance_issue',
  GENERAL = 'general',
}

@Entity('knowledge_base')
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    default: KnowledgeCategory.GENERAL,
  })
  category: KnowledgeCategory;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'vector', nullable: true })
  embedding: string;

  @Column({ name: 'embedding_model', type: 'varchar', length: 100, nullable: true })
  embeddingModel: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
