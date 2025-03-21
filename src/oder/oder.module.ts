import { Module } from '@nestjs/common';
import { OderService } from './oder.service';
import { OderController } from './oder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OderController],
  providers: [OderService],
})
export class OderModule {}
