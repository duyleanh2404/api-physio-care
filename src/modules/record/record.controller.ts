import {
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { RecordService } from './record.service';

import {
  ApiCreateRecord,
  ApiDeleteRecord,
  ApiUpdateRecord,
  ApiFindOneRecord,
  ApiFindAllRecords,
} from 'src/docs/swagger/record.swagger';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

@ApiTags('Record')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @Roles('admin', 'doctor')
  @ApiCreateRecord()
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreateRecordDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.recordService.create(dto, file);
  }

  @Put(':id')
  @Roles('admin', 'doctor')
  @ApiUpdateRecord()
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRecordDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.recordService.update(id, dto, file);
  }

  @Get()
  @Roles('admin', 'doctor')
  @ApiFindAllRecords()
  async findAll(@Query() query: GetRecordsQueryDto) {
    return this.recordService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'doctor')
  @ApiFindOneRecord()
  findOne(@Param('id') id: string) {
    return this.recordService.findOne(id);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  @ApiDeleteRecord()
  remove(@Param('id') id: string) {
    return this.recordService.remove(id);
  }
}
