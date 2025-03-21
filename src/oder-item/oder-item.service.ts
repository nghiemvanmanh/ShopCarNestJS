import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOderItemDto } from './dto/create-oder-item.dto';
import { UpdateOderItemDto } from './dto/update-oder-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'database/entities/order-item.entity';
import { Repository } from 'typeorm';
import { Order } from 'database/entities/order.entity';
import { Product } from 'database/entities/product.entity';
import { OderService } from 'src/oder/oder.service';
import { User } from 'database/entities/user.entity';

@Injectable()
export class OderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(
    userId: number,
    productId: number,
    createOrderItemDto: CreateOderItemDto,
    orderId?: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    // check User login
    if (!user) {
      throw new UnauthorizedException(`User ${userId} not found`);
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    // Tìm Product
    if (!product) {
      throw new UnauthorizedException('Product not found');
    }

    // Kiểm tra stock
    if (product.stock < createOrderItemDto.quantity) {
      throw new UnauthorizedException(
        `Not enough stock for product ID ${productId}`,
      );
    }
    let order: Order;
    if (orderId) {
      // Nếu có orderId thì tìm order đó
      order = await this.orderRepository.findOne({
        where: { id: orderId, user: { id: userId } },
      });
      if (!order) {
        throw new UnauthorizedException(`Order ${orderId} not found`);
      }
    } else {
      // Nếu không truyền orderId, tìm order PENDING của user
      order = await this.orderRepository.findOne({
        where: { user: { id: userId }, status: 'PENDING' },
        order: { created_at: 'DESC' }, // Lấy order mới nhất
      });
      // Nếu không có order nào, tạo mới
      if (!order) {
        order = this.orderRepository.create({
          user: user,
          total_amount: 0,
          status: 'PENDING',
        });
        await this.orderRepository.save(order);
      }
    }
    // Giảm stock và tạo OrderItem
    product.stock -= createOrderItemDto.quantity;

    const [_, orderItem] = await Promise.all([
      this.productRepository.save(product),
      this.orderItemRepository.save(
        this.orderItemRepository.create({
          ...createOrderItemDto,
          order: order,
          product: product,
          price: product.price,
        }),
      ),
    ]);

    // Tính lại total_amount cho Order mới save Order sau
    const orderItems = await this.orderItemRepository.find({
      where: { order: { id: order.id } },
      relations: ['product'],
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    order.total_amount = totalAmount;
    await this.orderRepository.save(order);

    // 7. Trả về OrderItem vừa thêm (có order_id mới)
    return orderItem;
  }

  findAll() {
    return `This action returns all oderItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oderItem`;
  }

  update(id: number, updateOderItemDto: UpdateOderItemDto) {
    return `This action updates a #${id} oderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} oderItem`;
  }
}
