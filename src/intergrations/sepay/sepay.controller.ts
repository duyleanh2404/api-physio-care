import {
  Post,
  Headers,
  Request,
  Response,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { SepayService } from './sepay.service';

@Controller('webhooks/sepay')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @Post()
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Headers('authorization') auth: string,
    @Request() req,
    @Response() res,
  ) {
    const API_KEY = process.env.SEPAY_API_KEY;
    const expectedAuth = `Apikey ${API_KEY}`;

    if (auth !== expectedAuth) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Unauthorized', received: auth });
    }

    await this.sepayService.processPaymentWebhook(req.body);

    return res.status(HttpStatus.OK).json({ message: 'OK' });
  }
}
