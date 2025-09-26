import {
  Put,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  ApiCreateUser,
  ApiUpdateUser,
  ApiDeleteUser,
  ApiFindMeUser,
  ApiFindOneUser,
  ApiFindAllUsers,
} from 'src/docs/swagger/user.swagger';
import { UserService } from './user.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiFindMeUser()
  async getMe(@Request() req) {
    const user = req.user as { id: string };
    return this.userService.findById(user.id);
  }

  @Get()
  @Roles('admin')
  @ApiFindAllUsers()
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles('admin')
  @ApiFindOneUser()
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @Roles('admin')
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiUpdateUser()
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiDeleteUser()
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
