import {
  Post,
  Headers,
  Request,
  Response,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { SepayService } from './sepay.service';

@Controller('webhooks/sepay')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @Post()
  async handleWebhook(
    @Headers('authorization') auth: string,
    @Request() req,
    @Response() res,
  ) {
    const API_KEY = process.env.SEPAY_API_KEY;

    if (auth !== `Apikey ${API_KEY}`) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Unauthorized' });
    }

    const data = req.body;

    await this.sepayService.processPaymentWebhook(data);

    return res.status(HttpStatus.OK).json({ message: 'OK' });
  }
}
