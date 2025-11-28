import { DataSource } from 'typeorm';
import { Client } from '../modules/client/entities/client.entity';
import { User } from '../modules/user/entities/user.entity';
import { RmmDevice } from '../modules/rmm/entities/rmm-device.entity';
import { RmmAction } from '../modules/rmm/entities/rmm-action.entity';
import { Ticket } from '../modules/psa/entities/ticket.entity';
import { TicketAttachment } from '../modules/psa/entities/ticket-attachment.entity';
import { seedDatabase } from './seed';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'it_agent',
  entities: [Client, User, RmmDevice, RmmAction, Ticket, TicketAttachment],
  synchronize: true,
});

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    await seedDatabase(dataSource);
    
    await dataSource.destroy();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
