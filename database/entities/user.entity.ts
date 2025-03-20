import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Review } from './review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
  @Column({ unique: true })
  email: string;

  @Column({ default: 'USER' })
  role: string;
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
