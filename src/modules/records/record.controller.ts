import {
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Request,
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
  ApiVerifyRecord,
  ApiFindOneRecord,
  ApiFindAllRecords,
  ApiDownloadRecord,
  ApiFindClinicRecords,
  ApiFindMyPatientsRecords,
  ApiDownloadEncryptedRecord,
} from 'src/docs/swagger/record.swagger';
import { RecordService } from './record.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';
import { GetMyPatientsRecordsQueryDto } from './dto/get-my-patients-records.dto';

@ApiTags('Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @ApiCreateRecord()
  @Roles('admin', 'doctor', 'clinic')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateRecordDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const signedById = req.user?.sub;
    return this.recordService.create(dto, req, file, signedById);
  }

  @Get()
  @Roles('admin')
  @ApiFindAllRecords()
  async findAll(@Query() query: GetRecordsQueryDto) {
    return this.recordService.findAll(query);
  }

  @Get('my-patients')
  @Roles('doctor')
  @ApiFindMyPatientsRecords()
  async findRecordsMyPatients(
    @Request() req,
    @Query() query: GetMyPatientsRecordsQueryDto,
  ) {
    const userId = req.user.sub;
    return this.recordService.findRecordsMyPatients(userId, query);
  }

  @Get('by-clinic')
  @Roles('clinic')
  @ApiFindClinicRecords()
  async findRecordsClinic(
    @Request() req,
    @Query() query: GetMyPatientsRecordsQueryDto,
  ) {
    const userId = req.user.sub;
    return this.recordService.findRecordsClinic(userId, query);
  }

  @Get(':id')
  @ApiFindOneRecord()
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.recordService.findOne(id);
  }

  @Get('download/encrypted/:id')
  @Roles('admin', 'doctor')
  @ApiDownloadEncryptedRecord()
  async downloadEncrypted(
    @Param('id') id: string,
    @Request() req,
    @Response() res,
  ) {
    return this.recordService.downloadEncryptedFile(
      id,
      req.user.sub,
      req.user.role,
      res,
    );
  }

  @Get('download/:id')
  @Roles('admin', 'doctor')
  @ApiDownloadRecord()
  async downloadFile(@Param('id') id: string, @Request() req, @Response() res) {
    return this.recordService.downloadFile(
      id,
      req.user.sub,
      req.user.role,
      res,
    );
  }

  @Put(':id')
  @ApiUpdateRecord()
  @Roles('admin', 'doctor')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRecordDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.recordService.update(
      id,
      req.user.sub,
      req.user.role,
      dto,
      file,
    );
  }

  @Delete(':id')
  @Roles('admin', 'doctor', 'clinic')
  @ApiDeleteRecord()
  async remove(@Param('id') id: string, @Request() req) {
    return this.recordService.remove(id, req.user.sub, req.user.role, req);
  }

  @Post('verify/:id')
  @ApiVerifyRecord()
  @Roles('admin', 'doctor')
  @UseInterceptors(FileInterceptor('attachment', { storage: memoryStorage() }))
  async verifyFile(
    @Param('id') id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.recordService.verifyFileIntegrity(
      id,
      req.user.sub,
      req.user.role,
      file,
    );
  }
}
