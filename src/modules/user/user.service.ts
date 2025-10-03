import * as argon2 from 'argon2';

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

import { User } from './user.entity';
import { UserStatus } from 'src/enums/user.enums';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: GetUsersQueryDto) {
    const {
      role,
      search,
      status,
      dateTo,
      dateFrom,
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC',
    } = query;

    const qb = this.userRepo.createQueryBuilder('user');

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(TRIM(user.fullName)) LIKE :keyword').orWhere(
            'LOWER(TRIM(user.email)) LIKE :keyword',
          );
        }),
        { keyword },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('user.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      });
    } else if (dateFrom) {
      qb.andWhere('user.createdAt >= :dateFrom', {
        dateFrom: new Date(dateFrom).toISOString(),
      });
    } else if (dateTo) {
      qb.andWhere('user.createdAt <= :dateTo', {
        dateTo: new Date(dateTo).toISOString(),
      });
    }

    qb.andWhere('user.role != :roleExclude', { roleExclude: 'admin' });

    const total = await qb.clone().getCount();

    const allowedFields = [
      'id',
      'role',
      'email',
      'status',
      'fullName',
      'provider',
      'avatarUrl',
      'createdAt',
      'updatedAt',
    ];
    qb.select(allowedFields.map((f) => `user.${f}`));

    qb.orderBy(`user.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const users = await qb.getMany();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: [
        'id',
        'role',
        'email',
        'status',
        'fullName',
        'provider',
        'avatarUrl',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto, avatar?: Express.Multer.File) {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    if (avatar) {
      const uploaded = await this.cloudinaryService.uploadImage(
        avatar,
        'avatar',
      );
      dto.avatarUrl = uploaded.secure_url;
    }

    if (!dto.status) {
      dto.status = UserStatus.ACTIVE;
    }

    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
    }

    const user = this.userRepo.create(dto);
    const savedUser = await this.userRepo.save(user);

    const { password, refreshToken, ...rest } = savedUser;
    return rest;
  }

  async update(id: string, dto: UpdateUserDto, avatar?: Express.Multer.File) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
    }

    if (avatar) {
      const uploaded = await this.cloudinaryService.uploadImage(
        avatar,
        'avatar',
      );

      dto.avatarUrl = uploaded.secure_url;
    }

    const updatedFields = Object.fromEntries(
      Object.entries(dto).filter(
        ([_, value]) => value !== undefined && value !== null && value !== '',
      ),
    );

    Object.assign(user, updatedFields);

    const savedUser = await this.userRepo.save(user);

    const { password, refreshToken, verificationOtp, otpExpiresAt, ...rest } =
      savedUser;
    return rest;
  }

  async ban(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === UserStatus.BANNED) {
      throw new ConflictException('User is already banned');
    }

    user.status = UserStatus.BANNED;
    const savedUser = await this.userRepo.save(user);

    const { password, refreshToken, verificationOtp, otpExpiresAt, ...rest } =
      savedUser;
    return rest;
  }

  async unban(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === UserStatus.ACTIVE) {
      throw new ConflictException('User is already active');
    }

    user.status = UserStatus.ACTIVE;
    const savedUser = await this.userRepo.save(user);

    const { password, refreshToken, verificationOtp, otpExpiresAt, ...rest } =
      savedUser;
    return rest;
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.delete(user.id);
    return { message: 'User deleted successfully' };
  }
}
