import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'database/entities/user.entity';
import { OrderItem } from 'database/entities/order-item.entity';
import { Product } from 'database/entities/product.entity';
import { ProductService } from 'src/product/product.service';

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
      // Giảm stock và lấy thông tin sản phẩm
      const products = await this.productService.decreaseStock(items);

      // Tính tổng tiền và tạo order items
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

      // Tạo order
      const order = manager.create(Order, {
        user: { id: userId },
        total_amount: totalAmount,
        status: 'PENDING',
        orderItems, // Gán trực tiếp orderItems vào order nếu có relation cascade
      });

      // Lưu order cùng orderItems 1 lần duy nhất
      await manager.save(order);

      return order;
    });
  }
}
