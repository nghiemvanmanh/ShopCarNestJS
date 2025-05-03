import { Module } from '@nestjs/common';
import { OderService } from './oder.service';
import { OderController } from './oder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';
import { User } from 'database/entities/user.entity';
import { Product } from 'database/entities/product.entity';
import { OrderItem } from 'database/entities/order-item.entity';
import { ProductModule } from 'src/product/product.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { Coupon } from 'database/entities/coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Product, OrderItem, Coupon]),
    ProductModule,
    CouponModule,
  ],
  controllers: [OderController],
  providers: [OderService],
  exports: [OderService],
})
export class OderModule {}
