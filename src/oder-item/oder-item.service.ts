import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOderItemDto } from './dto/create-oder-item.dto';
import { UpdateOderItemDto } from './dto/update-oder-item.dto';

@Injectable()
export class OderItemService {
  findAll() {
    return `This action returns all oderItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oderItem`;
  }

  update(id: number, updateOderItemDto: UpdateOderItemDto) {
    return `This action updates a #${id} oderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} oderItem`;
  }
}
