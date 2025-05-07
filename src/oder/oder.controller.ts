import {
  Controller,
  Request,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { OderService } from './oder.service';

interface PaymentsDto {
  orderIds: number[];
  couponId?: number;
  paymentMethod: string;
}

@Controller('order')
export class OderController {
  constructor(private readonly oderService: OderService) {}

  @Post('create')
  create(
    @Request() req,
    @Body() items: { productId: number; quantity: number; note: string }[],
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
  @Get('getOrder')
  getOrder(@Request() req) {
    const userId = req.user.id;
    return this.oderService.getOrder(userId);
  }

  @Delete('deleteOrder/:id')
  deleteOrder(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.oderService.deleteOrder(userId, id);
  }

  @Delete('deleteItemOrder/:id')
  deleteItemOrder(@Param('id') id: number) {
    return this.oderService.deleteItemOrder(id);
  }
}
