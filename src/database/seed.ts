import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Client, ClientStatus } from '../modules/client/entities/client.entity';
import { User, UserRole, UserStatus } from '../modules/user/entities/user.entity';
import { RmmDevice, DeviceType, OsType, DeviceStatus, RmmPlatform } from '../modules/rmm/entities/rmm-device.entity';
import { RmmAction, ActionType, ActionStatus } from '../modules/rmm/entities/rmm-action.entity';

const BCRYPT_SALT_ROUNDS = 12;
const SEED_PASSWORD = 'SecureP@ssw0rd123';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const clientRepo = dataSource.getRepository(Client);
  const userRepo = dataSource.getRepository(User);
  const deviceRepo = dataSource.getRepository(RmmDevice);
  const actionRepo = dataSource.getRepository(RmmAction);

  const existingClients = await clientRepo.count();
  if (existingClients > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);
  console.log('✓ Generated hashed password for seed users');

  const cisco = await clientRepo.save({
    name: 'Cisco Systems',
    industry: 'Technology',
    timezone: 'America/Los_Angeles',
    status: ClientStatus.ACTIVE,
  });

  const acme = await clientRepo.save({
    name: 'Acme Corporation',
    industry: 'Manufacturing',
    timezone: 'Europe/Berlin',
    status: ClientStatus.ACTIVE,
  });

  const alphora = await clientRepo.save({
    name: 'Alphora Holdings',
    industry: 'Financial Services',
    timezone: 'Europe/London',
    status: ClientStatus.ACTIVE,
  });

  console.log('✓ Created clients: Cisco, Acme, Alphora');

  const islam = await userRepo.save({
    clientId: cisco.id,
    email: 'islam.elkholy@cisco.com',
    passwordHash: hashedPassword,
    firstName: 'Islam',
    lastName: 'Elkholy',
    role: UserRole.ENGINEER_L3,
    phone: '+1-555-0101',
    status: UserStatus.ACTIVE,
  });

  const daniel = await userRepo.save({
    clientId: cisco.id,
    email: 'daniel.meyer@cisco.com',
    passwordHash: hashedPassword,
    firstName: 'Daniel',
    lastName: 'Meyer',
    role: UserRole.ENGINEER_L2,
    phone: '+1-555-0102',
    status: UserStatus.ACTIVE,
  });

  const kuba = await userRepo.save({
    clientId: acme.id,
    email: 'kuba.nowak@acme.com',
    passwordHash: hashedPassword,
    firstName: 'Kuba',
    lastName: 'Nowak',
    role: UserRole.ADMIN,
    phone: '+49-555-0201',
    status: UserStatus.ACTIVE,
  });

  const david = await userRepo.save({
    clientId: acme.id,
    email: 'david.schmidt@acme.com',
    passwordHash: hashedPassword,
    firstName: 'David',
    lastName: 'Schmidt',
    role: UserRole.ENGINEER_L1,
    phone: '+49-555-0202',
    status: UserStatus.ACTIVE,
  });

  await userRepo.save({
    clientId: alphora.id,
    email: 'sarah.johnson@alphora.com',
    passwordHash: hashedPassword,
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.ADMIN,
    phone: '+44-555-0301',
    status: UserStatus.ACTIVE,
  });

  console.log('✓ Created users: Islam, Daniel, Kuba, David, Sarah');

  const ciscoWks001 = await deviceRepo.save({
    clientId: cisco.id,
    deviceName: 'CISCO-WKS-001',
    hostname: 'cisco-workstation-01',
    deviceType: DeviceType.WORKSTATION,
    osType: OsType.WINDOWS,
    osVersion: 'Windows 11 Pro',
    ipAddress: '192.168.1.101',
    macAddress: '00:1A:2B:3C:4D:01',
    rmmPlatform: RmmPlatform.DATTO_RMM,
    externalDeviceId: 'DATTO-CSC-001',
    status: DeviceStatus.ONLINE,
    lastSeenAt: new Date(),
  });

  const ciscoSrv001 = await deviceRepo.save({
    clientId: cisco.id,
    deviceName: 'CISCO-SRV-001',
    hostname: 'cisco-server-01',
    deviceType: DeviceType.SERVER,
    osType: OsType.LINUX,
    osVersion: 'Ubuntu 22.04 LTS',
    ipAddress: '192.168.1.10',
    macAddress: '00:1A:2B:3C:4D:02',
    rmmPlatform: RmmPlatform.DATTO_RMM,
    externalDeviceId: 'DATTO-CSC-002',
    status: DeviceStatus.ONLINE,
    lastSeenAt: new Date(),
  });

  const ciscoLaptop045 = await deviceRepo.save({
    clientId: cisco.id,
    deviceName: 'CISCO-LAPTOP-045',
    hostname: 'cisco-laptop-45',
    deviceType: DeviceType.LAPTOP,
    osType: OsType.WINDOWS,
    osVersion: 'Windows 11 Pro',
    ipAddress: '192.168.1.145',
    macAddress: '00:1A:2B:3C:4D:45',
    rmmPlatform: RmmPlatform.DATTO_RMM,
    externalDeviceId: 'DATTO-CSC-045',
    status: DeviceStatus.OFFLINE,
    lastSeenAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  });

  const acmeWks001 = await deviceRepo.save({
    clientId: acme.id,
    deviceName: 'ACME-WKS-001',
    hostname: 'acme-workstation-01',
    deviceType: DeviceType.WORKSTATION,
    osType: OsType.WINDOWS,
    osVersion: 'Windows 10 Enterprise',
    ipAddress: '10.0.0.101',
    macAddress: '00:2B:3C:4D:5E:01',
    rmmPlatform: RmmPlatform.NINJA_ONE,
    externalDeviceId: 'NINJA-ACM-001',
    status: DeviceStatus.ONLINE,
    lastSeenAt: new Date(),
  });

  const acmeMac001 = await deviceRepo.save({
    clientId: acme.id,
    deviceName: 'ACME-MAC-001',
    hostname: 'acme-mac-01',
    deviceType: DeviceType.LAPTOP,
    osType: OsType.MACOS,
    osVersion: 'macOS Sonoma 14.2',
    ipAddress: '10.0.0.201',
    macAddress: '00:2B:3C:4D:5E:02',
    rmmPlatform: RmmPlatform.NINJA_ONE,
    externalDeviceId: 'NINJA-ACM-002',
    status: DeviceStatus.ONLINE,
    lastSeenAt: new Date(),
  });

  console.log('✓ Created RMM devices for Cisco and Acme');

  const action1 = actionRepo.create({
    rmmDeviceId: ciscoWks001.id,
    userId: islam.id,
    actionType: ActionType.SYSTEM_RESTART,
    actionName: 'Reboot System',
    description: 'Routine system restart for Windows updates',
    status: ActionStatus.COMPLETED,
    startedAt: new Date(Date.now() - 5 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 1000),
    resultData: { exitCode: 0, message: 'System restarted successfully' },
  });
  await actionRepo.save(action1);

  const action2 = actionRepo.create({
    rmmDeviceId: ciscoLaptop045.id,
    userId: daniel.id,
    actionType: ActionType.PASSWORD_RESET,
    actionName: 'Reset Local Admin Password',
    description: 'User forgot local admin password',
    status: ActionStatus.COMPLETED,
    startedAt: new Date(Date.now() - 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 58 * 60 * 1000),
    resultData: { success: true },
  });
  await actionRepo.save(action2);

  const action3 = actionRepo.create({
    rmmDeviceId: acmeWks001.id,
    userId: kuba.id,
    actionType: ActionType.SCRIPT_EXECUTION,
    actionName: 'Run Disk Cleanup Script',
    description: 'Automated disk cleanup for low storage alert',
    status: ActionStatus.COMPLETED,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000),
    resultData: { freedSpace: '15.2 GB', script: 'disk-cleanup.ps1' },
  });
  await actionRepo.save(action3);

  const action4 = actionRepo.create({
    rmmDeviceId: acmeMac001.id,
    userId: david.id,
    actionType: ActionType.BACKUP_CHECK,
    actionName: 'Verify Time Machine Backup',
    description: 'Weekly backup verification',
    status: ActionStatus.QUEUED,
  });
  await actionRepo.save(action4);

  const action5 = actionRepo.create({
    rmmDeviceId: ciscoSrv001.id,
    actionType: ActionType.SOFTWARE_INSTALL,
    actionName: 'Install Security Patches',
    description: 'Automated security patch installation',
    status: ActionStatus.FAILED,
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
    errorMessage: 'Package dependency conflict: libssl version mismatch',
  });
  await actionRepo.save(action5);

  console.log('✓ Created sample RMM actions');
  console.log('Database seeding completed!');
}
