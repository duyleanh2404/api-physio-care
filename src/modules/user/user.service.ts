import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(query: GetUsersQueryDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC',
      fields,
    } = query;

    const qb = this.userRepo.createQueryBuilder('user');

    if (search) {
      qb.where('user.email LIKE :search OR user.fullName LIKE :search', {
        search: `%${search}%`,
      });
    }

    const total = await qb.getCount();

    if (fields) {
      const allowedFields = [
        'id',
        'email',
        'fullName',
        'role',
        'createdAt',
        'updatedAt',
      ];
      const selectedFields = fields
        .split(',')
        .map((f) => f.trim())
        .filter((f) => allowedFields.includes(f))
        .map((f) => `user.${f}`);
      qb.select(selectedFields);
    }

    qb.orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const users = await qb.getMany();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users.map((u) => {
        const { password, refreshToken, ...rest } = u;
        return rest;
      }),
    };
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { password, refreshToken, ...rest } = user;
    return rest;
  }

  async findByIdWithRefreshToken(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    const user = this.userRepo.create({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      role: dto.role,
    });

    const savedUser = await this.userRepo.save(user);

    const { password, refreshToken, ...rest } = savedUser;
    return rest;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    const savedUser = await this.userRepo.save(user);

    const { password, refreshToken, ...rest } = savedUser;
    return rest;
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.delete(user.id);
    return { message: 'User deleted successfully' };
  }
}
