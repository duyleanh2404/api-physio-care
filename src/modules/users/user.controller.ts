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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import {
  ApiBanUser,
  ApiUnbanUser,
  ApiCreateUser,
  ApiUpdateUser,
  ApiDeleteUser,
  ApiFindMeUser,
  ApiFindOneUser,
  ApiFindAllUsers,
  ApiFindOneUserBySlug,
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

  @Post()
  @Roles('admin')
  @ApiCreateUser()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() dto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.userService.create(dto, avatar);
  }

  @Put(':id')
  @Roles('admin')
  @ApiUpdateUser()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.userService.update(id, dto, avatar);
  }

  @Put('ban/:id')
  @Roles('admin')
  @ApiBanUser()
  async ban(@Param('id') id: string) {
    return this.userService.ban(id);
  }

  @Put('unban/:id')
  @Roles('admin')
  @ApiUnbanUser()
  async unban(@Param('id') id: string) {
    return this.userService.unban(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiDeleteUser()
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get()
  @Roles('admin')
  @ApiFindAllUsers()
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiFindOneUserBySlug()
  async findBySlug(@Param('slug') slug: string) {
    return this.userService.findBySlug(slug);
  }

  @Get('me')
  @ApiFindMeUser()
  async findMe(@Request() req) {
    const user = req.user as { sub: string };
    return this.userService.findOne(user.sub);
  }

  @Get(':id')
  @Roles('admin')
  @ApiFindOneUser()
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
