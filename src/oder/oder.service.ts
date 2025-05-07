import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Order } from 'database/entities/order.entity';
import { OrderItem } from 'database/entities/order-item.entity';
import { Product } from 'database/entities/product.entity';
import { Payment } from 'database/entities/payment.entity';
import { Coupon } from 'database/entities/coupon.entity';

import { ProductService } from 'src/product/product.service';
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
    items: { productId: number; quantity: number; note?: string }[],
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const products = await this.productService.decreaseStock(manager, items);

      const orderItems = await Promise.all(
        products.flatMap((product) => {
          const productItems = items.filter((i) => i.productId === product.id);
          return productItems.map((item) =>
            manager.save(
              manager.create(OrderItem, {
                product,
                quantity: item.quantity,
                price: product.price,
                note: item.note,
              }),
            ),
          );
        }),
      );

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const order = manager.create(Order, {
        user: { id: userId },
        total_amount: totalAmount,
        status: 'PENDING',
        orderItems,
      });

      return manager.save(order);
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

      const finalAmount = coupon
        ? Math.max(
            coupon.unit === CouponUnit.PERCENT
              ? totalAmount * (1 - coupon.value / 100)
              : totalAmount - coupon.value,
            0,
          )
        : totalAmount;

      const payment = manager.create(Payment, {
        orders,
        coupon,
        amount: finalAmount,
        payment_method: paymentMethod,
        status: 'SUCCESS',
      });

      orders.forEach((order) => {
        order.status = 'COMPLETED';
        order.payments = payment;
      });

      await manager.save(orders);
      return manager.save(payment);
    });
  }

  async getOrder(userId: number) {
    const data = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .leftJoin('order.orderItems', 'orderItems')
      .leftJoin('orderItems.product', 'product')
      .select([
        'order.id AS order_id',
        'order.status AS status',
        'user.username AS username',
        'order.total_amount AS total_amount',
        'COUNT(DISTINCT orderItems.id) AS product_count',
        'SUM(orderItems.quantity) AS total_quantity',
        'orderItems.price AS item_price',
        'orderItems.quantity AS item_quantity',
        'orderItems.note AS item_note',
        'orderItems.id AS item_id',
        'product.name AS product_name',
      ])
      .where('order.userId = :userId', { userId })
      .groupBy('order.id')
      .addGroupBy('user.username')
      .addGroupBy('order.status')
      .addGroupBy('order.total_amount')
      .addGroupBy('orderItems.id')
      .addGroupBy('orderItems.price')
      .addGroupBy('orderItems.quantity')
      .addGroupBy('orderItems.note')
      .addGroupBy('orderItems.id')
      .addGroupBy('product.name')
      .orderBy('order.id', 'DESC')
      .getRawMany();

    const groupedOrders = data.reduce((acc, item) => {
      const orderId = item.order_id;
      const productDetail = {
        item_id: item.item_id,
        product_name: item.product_name,
        quantity: item.item_quantity,
        price: item.item_price * item.item_quantity,
        note: item.item_note,
      };

      const existingOrder = acc.find((order) => order.order_id === orderId);

      if (existingOrder) {
        existingOrder.products.push(productDetail);
        existingOrder.product_count++;
        existingOrder.total_quantity += Number(item.item_quantity);
      } else {
        acc.push({
          order_id: orderId,
          status: item.status,
          username: item.username,
          total_amount: item.total_amount,
          total_quantity: Number(item.total_quantity),
          product_count: 1,
          products: [productDetail],
        });
      }

      return acc;
    }, []);

    return groupedOrders;
  }

  async deleteOrder(userId: number, orderId: number) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId, user: { id: userId } },
        relations: ['orderItems', 'orderItems.product'],
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng!');
      }

      if (order.status !== 'PENDING') {
        throw new ConflictException('Đã thanh toán không thể hủy!');
      }

      for (const item of order.orderItems) {
        const result = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock + ${item.quantity}` })
          .where('id = :productId', { productId: item.product.id })
          .execute();

        if (result.affected === 0) {
          throw new ConflictException('Không thể hoàn lại sản phẩm');
        }
      }

      await Promise.all([
        manager.delete(OrderItem, { order: { id: orderId } }),
        manager.delete(Order, { id: orderId }),
      ]);
    });
  }

  async deleteItemOrder(orderItemId: number) {
    return this.dataSource.transaction(async (manager) => {
      const orderItem = await manager.findOne(OrderItem, {
        where: { id: orderItemId },
        relations: ['product', 'order'],
      });
      console.log(orderItem);
      if (!orderItem) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong đơn hàng!');
      }

      const order = orderItem.order;

      if (order.status !== 'PENDING') {
        throw new ConflictException('Đã thanh toán không thể hủy!');
      }

      for (const item of [orderItem]) {
        const result = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock + ${item.quantity}` })
          .where('id = :productId', { productId: item.product.id })
          .execute();

        if (result.affected === 0) {
          throw new ConflictException('Không thể hoàn lại sản phẩm');
        }
      }

      await manager.delete(OrderItem, { id: orderItemId });
      const remainingCount = await manager.count(OrderItem, {
        where: { order: { id: order.id } },
      });

      if (remainingCount === 0) {
        await manager.delete(Order, { id: order.id });
      }
    });
  }
}
