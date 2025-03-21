import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOderDto } from './dto/create-oder.dto';
import { UpdateOderDto } from './dto/update-oder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'database/entities/user.entity';

@Injectable()
export class OderService {
  update(id: number, updateOderDto: UpdateOderDto) {
    return `This action updates a #${id} oder`;
  }

  remove(id: number) {
    return `This action removes a #${id} oder`;
  }
}
