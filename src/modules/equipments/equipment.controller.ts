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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('clinic', 'admin')
  @ApiCreateEquipment()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEquipmentDto,
  ) {
    return this.equipmentService.create(req.user.sub, dto, file);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'clinic')
  @ApiFindAllEquipments()
  findAll(@Query() query: GetEquipmentsQueryDto) {
    return this.equipmentService.findAll(query);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('clinic')
  @ApiFindMyEquipments()
  findMyEquipments(@Request() req, @Query() query: GetMyEquipmentsQueryDto) {
    return this.equipmentService.findMyEquipments(req.user.sub, query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('clinic', 'admin')
  @ApiFindOneEquipment()
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('clinic', 'admin')
  @ApiUpdateEquipment()
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, req.user.sub, dto);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('clinic', 'admin')
  @ApiUpdateEquipmentStatus()
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateEquipmentStatusDto,
  ) {
    return this.equipmentService.updateStatus(id, req.user.sub, dto.status);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('clinic', 'admin')
  @ApiDeleteEquipment()
  remove(@Param('id') id: string, @Request() req) {
    return this.equipmentService.remove(id, req.user.sub);
  }
}
