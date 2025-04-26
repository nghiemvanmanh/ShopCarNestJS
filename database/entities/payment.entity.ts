import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Coupon } from './coupon.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Order, (oder) => oder.payments)
  order: Order[];

  @ManyToOne(() => Coupon, (coupon) => coupon.payments)
  coupon: Coupon;

  @Column('decimal')
  amount: number;

  @Column()
  payment_method: string;

  @Column()
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
