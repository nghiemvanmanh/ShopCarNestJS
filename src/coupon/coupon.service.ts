import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from 'database/entities/coupon.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couPonRepostitory: Repository<Coupon>,
  ) {}
  async create(createCouponDto: CreateCouponDto) {
    const coupon = await this.couPonRepostitory.findOne({
      where: { description: createCouponDto.description },
    });
    if (coupon) {
      coupon.quantity += createCouponDto.quantity;
      return await this.couPonRepostitory.save(coupon);
    }
    const newCoupon = await this.couPonRepostitory.create(createCouponDto);
    return await this.couPonRepostitory.save(newCoupon);
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  async decreaseCouponWithAtomic(manager: EntityManager, couponId: number) {
    const result = await manager
      .createQueryBuilder()
      .update(Coupon)
      .set({
        quantity: () => 'quantity - 1',
        is_active: () => 'CASE WHEN quantity = 1 THEN false ELSE is_active END',
      })
      .where('id = :couponId AND quantity > 0', { couponId })
      .returning('*')
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('Coupon not found or insufficient quantity');
    }
    return manager.save(Coupon, result.raw[0]);
  }
}
