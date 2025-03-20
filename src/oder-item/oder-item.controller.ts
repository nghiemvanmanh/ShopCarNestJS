import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OderItemService } from './oder-item.service';
import { CreateOderItemDto } from './dto/create-oder-item.dto';
import { UpdateOderItemDto } from './dto/update-oder-item.dto';

@Controller('oder-item')
export class OderItemController {
  constructor(private readonly oderItemService: OderItemService) {}

  @Post()
  create(@Body() createOderItemDto: CreateOderItemDto) {
    return this.oderItemService.create(createOderItemDto);
  }

  @Get()
  findAll() {
    return this.oderItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oderItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOderItemDto: UpdateOderItemDto) {
    return this.oderItemService.update(+id, updateOderItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oderItemService.remove(+id);
  }
}
