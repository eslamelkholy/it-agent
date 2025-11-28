import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RmmDevice, DeviceStatus } from './entities/rmm-device.entity';
import { RmmAction, ActionStatus } from './entities/rmm-action.entity';
import { CreateRmmDeviceDto, UpdateRmmDeviceDto, CreateRmmActionDto } from './dto';

@Injectable()
export class RmmService {
  constructor(
    @InjectRepository(RmmDevice)
    private readonly deviceRepository: Repository<RmmDevice>,
    @InjectRepository(RmmAction)
    private readonly actionRepository: Repository<RmmAction>,
  ) {}

  async createDevice(createDto: CreateRmmDeviceDto): Promise<RmmDevice> {
    const device = this.deviceRepository.create({
      ...createDto,
      lastSeenAt: new Date(),
    });
    return this.deviceRepository.save(device);
  }

  async findAllDevices(clientId?: string): Promise<RmmDevice[]> {
    const where = clientId ? { clientId } : {};
    return this.deviceRepository.find({
      where,
      relations: ['client'],
      order: { deviceName: 'ASC' },
    });
  }

  async findDeviceById(id: string): Promise<RmmDevice> {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: ['client', 'rmmActions'],
    });
    if (!device) {
      throw new NotFoundException(`RMM Device with ID "${id}" not found`);
    }
    return device;
  }

  async updateDevice(id: string, updateDto: UpdateRmmDeviceDto): Promise<RmmDevice> {
    const device = await this.findDeviceById(id);
    Object.assign(device, updateDto);
    return this.deviceRepository.save(device);
  }

  async updateDeviceStatus(id: string, status: DeviceStatus): Promise<RmmDevice> {
    const device = await this.findDeviceById(id);
    device.status = status;
    device.lastSeenAt = new Date();
    return this.deviceRepository.save(device);
  }

  async removeDevice(id: string): Promise<void> {
    const device = await this.findDeviceById(id);
    await this.deviceRepository.remove(device);
  }

  async createAction(createDto: CreateRmmActionDto): Promise<RmmAction> {
    const action = this.actionRepository.create({
      ...createDto,
      status: ActionStatus.QUEUED,
    });
    return this.actionRepository.save(action);
  }

  async executeAction(id: string): Promise<RmmAction> {
    const action = await this.findActionById(id);
    action.status = ActionStatus.RUNNING;
    action.startedAt = new Date();
    await this.actionRepository.save(action);

    action.status = ActionStatus.COMPLETED;
    action.completedAt = new Date();
    action.resultData = { success: true, message: 'Action completed successfully' };
    
    return this.actionRepository.save(action);
  }

  async findActionById(id: string): Promise<RmmAction> {
    const action = await this.actionRepository.findOne({
      where: { id },
      relations: ['rmmDevice', 'user'],
    });
    if (!action) {
      throw new NotFoundException(`RMM Action with ID "${id}" not found`);
    }
    return action;
  }

  async findActionsByDevice(deviceId: string): Promise<RmmAction[]> {
    return this.actionRepository.find({
      where: { rmmDeviceId: deviceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findRecentActions(limit: number = 10): Promise<RmmAction[]> {
    return this.actionRepository.find({
      relations: ['rmmDevice', 'user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
