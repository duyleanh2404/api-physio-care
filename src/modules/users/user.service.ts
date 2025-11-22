import * as argon2 from 'argon2';

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { slugifyName } from 'src/utils/slugify';

import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

import { User } from './user.entity';
import { UserRole, UserStatus } from 'src/enums/user.enums';
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

    const parseArray = (val: any) =>
      Array.isArray(val)
        ? val
        : typeof val === 'string'
          ? val
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
          : [];

    const roleList = parseArray(role);
    if (roleList.length)
      qb.andWhere('user.role IN (:...roleList)', { roleList });

    const statusList = parseArray(status);
    if (statusList.length)
      qb.andWhere('user.status IN (:...statusList)', { statusList });

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
    const totalPages = Math.ceil(total / limit);

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
      totalPages,
      data: users,
    };
  }

  async findBySlug(slug: string) {
    const user = await this.userRepo.findOne({ where: { slug } });
    if (!user) throw new NotFoundException('User not found');

    const {
      password,
      verificationOtp,
      otpExpiresAt,
      slug: _slug,
      ...rest
    } = user;
    return rest;
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
        'lastPasswordChangeAt',
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

  async create(user: Partial<User>, avatar?: Express.Multer.File) {
    if (user.email && (await this.findByEmail(user.email))) {
      throw new ConflictException(`Email ${user.email} already exists`);
    }

    if (avatar) {
      const uploaded = await this.cloudinaryService.uploadImage(
        avatar,
        'avatar',
      );
      user.avatarUrl = uploaded.secure_url;
    }

    if (!user.status) {
      user.status = UserStatus.ACTIVE;
    }

    if (user.password) {
      user.password = await argon2.hash(user.password);
    }

    if (user.fullName) {
      let slug = slugifyName(user.fullName);

      const existingSlug = await this.userRepo.findOne({ where: { slug } });
      if (existingSlug) {
        const randomSuffix = Math.floor(Math.random() * 10000);
        slug = `${slug}-${randomSuffix}`;
      }
      user.slug = slug;
    }

    const entity = this.userRepo.create(user);
    const savedUser = await this.userRepo.save(entity);

    const { password, ...rest } = savedUser;
    return rest;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    avatar?: Express.Multer.File,
    currentUser?: any,
  ) {
    if (currentUser && currentUser.role !== UserRole.ADMIN) {
      if (currentUser.sub !== id) {
        throw new ForbiddenException(
          "You are not authorized to update another user's information",
        );
      }
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
      dto.lastPasswordChangeAt = new Date();
    }

    if (avatar) {
      const uploaded = await this.cloudinaryService.uploadImage(
        avatar,
        'avatar',
      );
      dto.avatarUrl = uploaded.secure_url;
    }

    const updatedFields = Object.fromEntries(
      Object.entries(dto).filter(([key, value]) => {
        if (value === undefined || value === '') return false;
        if (value === null && !['verificationOtp', 'otpExpiresAt'].includes(key))
          return false;
        return true;
      }),
    );

    Object.assign(user, updatedFields);

    const savedUser = await this.userRepo.save(user);

    const { password, verificationOtp, otpExpiresAt, ...rest } = savedUser;
    return rest;
  }

  async ban(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === UserStatus.BANNED) {
      throw new ConflictException('User is already banned');
    }

    user.status = UserStatus.BANNED;
    user.locked = true;

    const savedUser = await this.userRepo.save(user);

    const { password, verificationOtp, otpExpiresAt, ...rest } = savedUser;
    return rest;
  }

  async unban(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === UserStatus.ACTIVE && !user.locked) {
      throw new ConflictException('User is already active');
    }

    user.status = UserStatus.ACTIVE;
    user.locked = false;
    user.failedLoginAttempts = 0;

    const savedUser = await this.userRepo.save(user);

    const { password, verificationOtp, otpExpiresAt, ...rest } = savedUser;
    return rest;
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.delete(user.id);

    return { message: 'User deleted successfully' };
  }
}
