import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    
    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User created with ID: ${savedUser.id}`);
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['client'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['client'],
    });
  }

  async findByClientId(clientId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { clientId },
      relations: ['client'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    this.logger.log(`Updating user with ID: ${id}`);
    
    const { password, ...updateFields } = updateUserDto;
    
    if (password) {
      user.passwordHash = await this.hashPassword(password);
    }

    Object.assign(user, updateFields);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    this.logger.log(`Removing user with ID: ${id}`);
    await this.userRepository.remove(user);
  }
}
