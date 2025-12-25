import {
  Get,
  Put,
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
  ApiCreateEquipment,
  ApiDeleteEquipment,
  ApiUpdateEquipment,
  ApiFindMyEquipments,
  ApiFindOneEquipment,
  ApiFindAllEquipments,
  ApiUpdateEquipmentStatus,
} from 'src/docs/swagger/equipment.swagger';
import { EquipmentService } from './equipment.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { GetEquipmentsQueryDto } from './dto/get-equipments-query.dto';
import { GetMyEquipmentsQueryDto } from './dto/get-my-equipments-query.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';

@ApiTags('Equipments')
@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiBearerAuth()
  @ApiCreateEquipment()
  @Roles('clinic', 'admin')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Request() req,
    @Body() dto: CreateEquipmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.equipmentService.create(req.user.sub, dto, req, file);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiFindAllEquipments()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Query() query: GetEquipmentsQueryDto) {
    return this.equipmentService.findAll(query);
  }

  @Get('me')
  @ApiBearerAuth()
  @Roles('clinic')
  @ApiFindMyEquipments()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findMyEquipments(@Request() req, @Query() query: GetMyEquipmentsQueryDto) {
    return this.equipmentService.findMyEquipments(req.user.sub, query);
  }

  @Get(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiFindOneEquipment()
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiUpdateEquipment()
  @Roles('clinic', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.equipmentService.update(
      id,
      req.user.role,
      req.user.sub,
      dto,
      file,
    );
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles('clinic', 'admin')
  @ApiUpdateEquipmentStatus()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateEquipmentStatusDto,
  ) {
    return this.equipmentService.updateStatus(
      id,
      req.user.sub,
      req.user.role,
      dto.status,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('clinic', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiDeleteEquipment()
  remove(@Param('id') id: string, @Request() req) {
    return this.equipmentService.remove(id, req.user.sub, req.user.role, req);
  }
}
