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
    @InjectRepository(OrderItem)
    private productService: ProductService,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<OrderItem> {
    return await this.dataSource.transaction(async (manager) => {
      // Tạo hoặc lấy order PENDING của user
      let order = await manager.findOne(Order, {
        where: { user: { id: userId }, status: 'PENDING' },
        order: { created_at: 'DESC' }, // Tìm order PENDING mới nhất ,
      });

      if (!order) {
        order = manager.create(Order, {
          user: { id: userId },
          total_amount: 0,
          status: 'PENDING',
        });
        await manager.save(order);
      }

      // Kiểm tra Product tồn tại hay không
      const product = await manager.findOne(Product, {
        where: { id: productId },
      });
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.stock < quantity) {
        throw new Error('Not enough stock');
      }

      // Tạo order item
      const orderItem = manager.create(OrderItem, {
        order: order,
        product: product,
        quantity: quantity,
        price: product.price,
      });
      await manager.save(orderItem);

      // Giảm stock thông qua productService
      await this.productService.decreaseStock(productId, quantity);

      // Tính lại total_amount
      order.total_amount += product.price * quantity;
      await manager.save(order);

      return orderItem;
    });
  }
}
