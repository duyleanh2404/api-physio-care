import {
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Response,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiCreateRecord,
  ApiDeleteRecord,
  ApiUpdateRecord,
  ApiFindOneRecord,
  ApiFindAllRecords,
  ApiDownloadRecord,
} from 'src/docs/swagger/record.swagger';
import { RecordService } from './record.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

@ApiTags('Records')
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
    }),
  )
  async create(
    @Body() dto: CreateRecordDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.recordService.create(dto, file);
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
  async findOne(@Param('id') id: string) {
    return this.recordService.findOne(id);
  }

  @Get('download/:id')
  @ApiDownloadRecord()
  async downloadFile(@Param('id') id: string, @Response() res) {
    return this.recordService.downloadFile(id, res);
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

  @Delete(':id')
  @Roles('admin', 'doctor')
  @ApiDeleteRecord()
  async remove(@Param('id') id: string) {
    return this.recordService.remove(id);
  }
}
