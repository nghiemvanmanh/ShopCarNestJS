import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'database/entities/user.entity';
import { OrderItem } from 'database/entities/order-item.entity';
import { Product } from 'database/entities/product.entity';
import { ProductService } from 'src/product/product.service';
import { Payment } from 'database/entities/payment.entity';

@Injectable()
export class OderService {
  constructor(
    private productService: ProductService,
    @InjectRepository(OrderItem)
    @InjectRepository(Product)
    private dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    items: { productId: number; quantity: number }[],
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const products = await this.productService.decreaseStock(manager, items);
      const orderItems = products.map((product) => {
        const item = items.find((i) => i.productId === product.id);
        return manager.create(OrderItem, {
          product,
          quantity: item.quantity,
          price: product.price,
        });
      });

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return await manager.save(Order, {
        user: { id: userId },
        total_amount: totalAmount,
        status: 'PENDING',
        orderItems,
      });
    });
  }

  async payments(orderId: number, paymentMethod: string): Promise<Payment> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['orderItems'],
      });

      if (!order) {
        throw new Error('Order not found');
      }
      if (order.status !== 'PENDING') {
        throw new Error('Order cannot be compeleted');
      }
      const payment = await manager.create(Payment, {
        order,
        amount: order.total_amount,
        payment_method: paymentMethod,
        status: 'SUCCESS',
      });
      order.status = 'COMPLETED';
      await manager.save([order, payment]);
      return payment;
    });
  }
}
