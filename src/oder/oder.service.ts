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
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    items: { productId: number; quantity: number }[],
  ): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      // Tạo hoặc lấy order PENDING của user trong transaction
      let order = await manager.findOne(Order, {
        where: { user: { id: userId }, status: 'PENDING' },
        order: { created_at: 'DESC' },
      });

      if (!order) {
        order = manager.create(Order, {
          user: { id: userId },
          total_amount: 0,
          status: 'PENDING',
        });
        await manager.save(order);
      }

      let totalAmount = order.total_amount;

      // Thêm từng order item (ngoài transaction)
      for (const { productId, quantity } of items) {
        try {
          const product = await this.productRepository.findOne({
            where: { id: productId },
          });

          if (!product) {
            console.warn(`Product with ID ${productId} not found, skipping.`);
            continue;
          }

          if (product.stock < quantity) {
            console.warn(
              `Not enough stock for product ID ${productId}, skipping.`,
            );
            continue;
          }

          // Tạo order item
          const orderItem = this.orderItemRepository.create({
            order: order,
            product: product,
            quantity: quantity,
            price: product.price,
          });
          await this.orderItemRepository.save(orderItem);

          // Giảm stock sau khi tạo order-item
          await this.productService.decreaseStock(productId, quantity);

          // Cập nhật tổng tiền
          totalAmount += product.price * quantity;
        } catch (error) {
          console.error(
            `Error adding product ID ${productId}: ${error.message}`,
          );
        }
      }
      order.total_amount = totalAmount;
      await manager.save(order);

      return order;
    });
  }
}
