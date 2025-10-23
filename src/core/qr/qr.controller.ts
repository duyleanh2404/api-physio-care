import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';

import { ScanQrDto } from './dto/scan-qr.dto';
import { RequestQrDto } from './dto/request-qr.dto';

import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiRequestQr, ApiScanQr } from 'src/docs/swagger/qr.swagger';

@ApiTags('QR')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('request')
  @ApiRequestQr()
  async requestQr(@Body() dto: RequestQrDto, @Request() req) {
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress ||
      'Unknown IP';
    return this.qrService.createQrByEmail(dto.email, ipAddress);
  }

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  @ApiScanQr()
  async scanQr(@Body() dto: ScanQrDto, @Request() req) {
    const user = req.user as any;
    return this.qrService.confirmQrLogin(dto.nonce, user.sub);
  }
}
