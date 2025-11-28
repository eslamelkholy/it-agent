import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RmmService } from './rmm.service';
import { CreateRmmDeviceDto, UpdateRmmDeviceDto, CreateRmmActionDto } from './dto';
import { DeviceStatus } from './entities/rmm-device.entity';

@Controller('rmm')
export class RmmController {
  constructor(private readonly rmmService: RmmService) {}

  @Post('devices')
  createDevice(@Body() createDto: CreateRmmDeviceDto) {
    return this.rmmService.createDevice(createDto);
  }

  @Get('devices')
  findAllDevices(@Query('clientId') clientId?: string) {
    return this.rmmService.findAllDevices(clientId);
  }

  @Get('devices/:id')
  findDeviceById(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmmService.findDeviceById(id);
  }

  @Patch('devices/:id')
  updateDevice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRmmDeviceDto,
  ) {
    return this.rmmService.updateDevice(id, updateDto);
  }

  @Patch('devices/:id/status')
  updateDeviceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DeviceStatus,
  ) {
    return this.rmmService.updateDeviceStatus(id, status);
  }

  @Delete('devices/:id')
  removeDevice(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmmService.removeDevice(id);
  }

  @Post('actions')
  createAction(@Body() createDto: CreateRmmActionDto) {
    return this.rmmService.createAction(createDto);
  }

  @Post('actions/:id/execute')
  executeAction(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmmService.executeAction(id);
  }

  @Get('actions/:id')
  findActionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmmService.findActionById(id);
  }

  @Get('devices/:deviceId/actions')
  findActionsByDevice(@Param('deviceId', ParseUUIDPipe) deviceId: string) {
    return this.rmmService.findActionsByDevice(deviceId);
  }

  @Get('actions')
  findRecentActions(@Query('limit') limit?: number) {
    return this.rmmService.findRecentActions(limit || 10);
  }
}
