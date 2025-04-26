import {
  Controller,
  Request,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OderService } from './oder.service';

interface PaymentsDto {
  orderIds: number[];
  couponId?: number;
  paymentMethod: string;
}
@Controller('oder')
export class OderController {
  constructor(private readonly oderService: OderService) {}

  @Post('create')
  create(
    @Request() req,
    @Body() items: { productId: number; quantity: number }[],
  ) {
    const userId = req.user.id;
    return this.oderService.create(userId, items);
  }

  @Post('payments')
  payments(
    @Body()
    body: PaymentsDto,
  ) {
    return this.oderService.checkout(
      body.orderIds,
      body.couponId,
      body.paymentMethod,
    );
  }
}
