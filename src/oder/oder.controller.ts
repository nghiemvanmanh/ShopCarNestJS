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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOderDto: UpdateOderDto) {
    return this.oderService.update(+id, updateOderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oderService.remove(+id);
  }
}
