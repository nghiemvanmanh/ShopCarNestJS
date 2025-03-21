import { Module } from '@nestjs/common';
import { OderItemService } from './oder-item.service';
import { OderItemController } from './oder-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'database/entities/order-item.entity';
import { Order } from 'database/entities/order.entity';
import { Product } from 'database/entities/product.entity';
import { User } from 'database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User])],
  controllers: [OderItemController],
  providers: [OderItemService],
})
export class OderItemModule {}
