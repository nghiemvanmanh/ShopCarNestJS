import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'database/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'database/entities/user.entity';
import { OrderItem } from 'database/entities/order-item.entity';
import { Product } from 'database/entities/product.entity';
import { ProductService } from 'src/product/product.service';
import { Payment } from 'database/entities/payment.entity';
import { Coupon } from 'database/entities/coupon.entity';
import { CouponService } from 'src/coupon/coupon.service';
import { CouponUnit } from 'src/common/enums/coupon-unit.enum';

@Injectable()
export class OderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductService,
    private couponService: CouponService,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    items: { productId: number; quantity: number }[],
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const products = await this.productService.decreaseStock(manager, items);
      const orderItems = await Promise.all(
        products.map((product) => {
          const item = items.find((i) => i.productId === product.id);
          return manager.save(
            manager.create(OrderItem, {
              product,
              quantity: item.quantity,
              price: product.price,
            }),
          );
        }),
      );
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

  async checkout(
    orderIds: number[],
    couponId: number,
    paymentMethod: string,
  ): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const orders = await manager.find(Order, {
        where: orderIds.map((id) => ({ id })),
        relations: ['orderItems'],
      });

      if (orders.length !== orderIds.length) {
        throw new NotFoundException('One or more orders not found');
      }

      if (orders.some((order) => order.status !== 'PENDING')) {
        throw new ConflictException('Some orders cannot be completed');
      }

      let coupon: Coupon = null;
      if (couponId) {
        coupon = await this.couponService.decreaseCouponWithAtomic(
          manager,
          couponId,
        );
      }

      const totalAmount = orders.reduce(
        (sum, order) => sum + order.total_amount,
        0,
      );
      let finalAmount = totalAmount;

      if (coupon) {
        finalAmount =
          coupon.unit === CouponUnit.PERCENT
            ? totalAmount * (1 - coupon.value / 100)
            : totalAmount - coupon.value;

        finalAmount = Math.max(finalAmount, 0);
      }
      const payment = await manager.create(Payment, {
        orders,
        coupon,
        amount: finalAmount,
        payment_method: paymentMethod,
        status: 'SUCCESS',
      });
      for (const order of orders) {
        order.status = 'COMPLETED';
        order.payments = payment;
      }

      await manager.save(orders);
      return manager.save(payment);
    });
  }

  /**
   * @description lấy danh dách order từ người dùng
   * @param userId
   * @returns
   */
  async getOrder(userId: number) {
    const data = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .leftJoin('order.orderItems', 'orderItems')
      .leftJoin('orderItems.product', 'product')
      .select([
        'order.id AS order_id',
        'user.username AS username',
        'order.total_amount AS total_amount',
        'orderItems.price AS price',
        'orderItems.quantity AS quantity',
        'product.name AS product',
      ])
      .orderBy('order.id', 'DESC')
      .where('order.userId = :userId', { userId })
      .getRawMany();

    const dataGroupByProduct = data.reduce((acc, item) => {
      const existingProduct = acc.find(
        (i) => i.product === item.product && i.order_id === item.order_id,
      );
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
        existingProduct.price = item.total_amount;
      } else {
        acc.push({
          ...item,
          price: item.price * item.quantity,
        });
      }
      return acc;
    }, []);
    return dataGroupByProduct;
  }
}
