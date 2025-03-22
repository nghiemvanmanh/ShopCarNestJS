import { Module } from '@nestjs/common';
import { OderService } from './oder.service';
import { OderController } from './oder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';
import { User } from 'database/entities/user.entity';
import { Product } from 'database/entities/product.entity';
import { OrderItem } from 'database/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product, OrderItem])],
  controllers: [OderController],
  providers: [OderService],
  exports: [OderService],
})
export class OderModule {}
