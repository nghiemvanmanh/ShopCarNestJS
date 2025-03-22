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
import { UpdateOderDto } from './dto/update-oder.dto';

@Controller('oder')
export class OderController {
  constructor(private readonly oderService: OderService) {}

  @Post('create')
  create(
    @Request() req,
    @Param('productId') productId: number,
    @Param('quantity') quantity: number,
  ) {
    const userId = req.user.id;
    return this.oderService.create(userId, productId, quantity);
  }
}
