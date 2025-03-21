import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { OderItemService } from './oder-item.service';
import { CreateOderItemDto } from './dto/create-oder-item.dto';
import { UpdateOderItemDto } from './dto/update-oder-item.dto';
import { Public } from 'src/auth/decorators/custompublic';

@Controller('oder-item')
export class OderItemController {
  constructor(private readonly oderItemService: OderItemService) {}

  @Post('create')
  create(
    @Request() req,
    @Param('productId') productId: number,
    @Body() createOderItemDto: CreateOderItemDto,
    @Query('orderId') orderId?: number,
  ) {
    const userID = req.user.id;
    console.log('hihihi');
    console.log('Id' + userID);
    return this.oderItemService.create(
      userID,
      productId,
      createOderItemDto,
      orderId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOderItemDto: UpdateOderItemDto,
  ) {
    return this.oderItemService.update(+id, updateOderItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oderItemService.remove(+id);
  }
}
