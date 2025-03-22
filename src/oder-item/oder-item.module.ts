import { Module } from '@nestjs/common';
import { OderItemService } from './oder-item.service';
import { OderItemController } from './oder-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'database/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  controllers: [OderItemController],
  providers: [OderItemService],
})
export class OderItemModule {}
