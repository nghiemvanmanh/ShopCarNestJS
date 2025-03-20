import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { OderItemService } from './oder-item.service';
import { CreateOderItemDto } from './dto/create-oder-item.dto';
import { UpdateOderItemDto } from './dto/update-oder-item.dto';
import { ProductService } from 'src/product/product.service';
import { OderService } from 'src/oder/oder.service';
import { Public } from 'src/auth/decorators/custompublic';

@Controller('oder-item')
export class OderItemController {
  constructor(private readonly oderItemService: OderItemService) {}

  @Public()
  @Post('create')
  create(
    @Request() req,
    @Param('productId') productId: number,
    @Body() createOderItemDto: CreateOderItemDto,
  ) {
    return this.oderItemService.create(
      req.user.id,
      productId,
      createOderItemDto,
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
