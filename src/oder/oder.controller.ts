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
import { CreateOderDto } from './dto/create-oder.dto';
import { UpdateOderDto } from './dto/update-oder.dto';

@Controller('oder')
export class OderController {
  constructor(private readonly oderService: OderService) {}

  @Post('create')
  create(@Request() req, @Body() createOderDto: CreateOderDto) {
    const user = req.user;
    return this.oderService.create(user.id, createOderDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOderDto: UpdateOderDto) {
    return this.oderService.update(+id, updateOderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oderService.remove(+id);
  }
}
