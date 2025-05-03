import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { CouponUnit } from 'src/common/enums/coupon-unit.enum';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('decimal')
  value: number;
  @Column()
  description: string;
  @Column({ type: 'enum', enum: CouponUnit })
  unit: CouponUnit;
  @Column('int')
  quantity: number;
  @Column('boolean', { default: true })
  is_active: boolean;
  @OneToMany(() => Payment, (payment) => payment.coupon)
  payments: Payment[];
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;
}
