import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOderItemDto } from './dto/create-oder-item.dto';
import { UpdateOderItemDto } from './dto/update-oder-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'database/entities/order-item.entity';
import { Repository } from 'typeorm';
import { Order } from 'database/entities/order.entity';
import { Product } from 'database/entities/product.entity';

@Injectable()
export class OderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}
  async create(
    orderId: number,
    productId: number,
    createOderItemDto: CreateOderItemDto,
  ) {
    const [order, product] = await Promise.all([
      this.orderRepository.findOne({ where: { id: orderId } }),
      this.productRepository.findOne({ where: { id: productId } }),
    ]);

    if (!order) {
      throw new UnauthorizedException('Order not found');
    }

    if (!product) {
      throw new UnauthorizedException('Product not found');
    }
    if (product.stock < createOderItemDto.quantity) {
      throw new UnauthorizedException(
        `Not enough stock for product ID ${productId}`,
      );
    }

    //Giảm số lượng trong Product
    product.stock -= createOderItemDto.quantity;
    const [_, orderItem] = await Promise.all([
      this.productRepository.save(product),
      this.orderItemRepository.create({
        ...createOderItemDto,
        order: order,
        product: product,
        price: product.price,
      }),
    ]);

    const orderItems = await this.orderItemRepository.find({
      where: { order: { id: order.id } },
      relations: ['product'],
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    order.total_amount = totalAmount;

    await Promise.all([
      this.orderRepository.save(order),
      this.orderItemRepository.save(orderItem),
    ]);
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
