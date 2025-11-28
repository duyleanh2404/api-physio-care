import {
  Get,
  Post,
  Put,
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
  ApiCreatePackage,
  ApiDeletePackage,
  ApiUpdatePackage,
  ApiFindMyPackages,
  ApiFindOnePackage,
  ApiFindAllPackages,
  ApiFindPackageByCode,
} from 'src/docs/swagger/package.swagger';
import { PackagesService } from './packages.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { GetPackagesQueryDto } from './dto/get-packages-query.dto';
import { GetMyPackagesQueryDto } from './dto/get-my-packages-query.dto';

@ApiTags('Packages')
@Controller('packages')
@ApiBearerAuth()
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @Roles('clinic', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreatePackage()
  create(@Request() req, @Body() dto: CreatePackageDto) {
    return this.packagesService.create(req.user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiFindAllPackages()
  findAll(@Query() query: GetPackagesQueryDto) {
    return this.packagesService.findAll(query);
  }

  @Get('me')
  @Roles('clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindMyPackages()
  findMyPackages(@Request() req, @Query() query: GetMyPackagesQueryDto) {
    return this.packagesService.findMyPackages(req.user.sub, query);
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  @ApiFindPackageByCode()
  findByCode(@Param('code') code: string) {
    return this.packagesService.findByCode(code);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiFindOnePackage()
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Put(':id')
  @Roles('clinic', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUpdatePackage()
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, req.user.role, req.user.sub, dto);
  }

  @Delete(':id')
  @Roles('clinic', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiDeletePackage()
  remove(@Param('id') id: string, @Request() req) {
    return this.packagesService.remove(id, req.user.sub, req.user.role);
  }
}
