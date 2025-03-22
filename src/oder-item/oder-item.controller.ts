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
import { UpdateOderItemDto } from './dto/update-oder-item.dto';

@Controller('oder-item')
export class OderItemController {
  constructor(private readonly oderItemService: OderItemService) {}

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
