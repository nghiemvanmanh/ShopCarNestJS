import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'database/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Review } from 'database/entities/review.entity';
import { Product } from 'database/entities/product.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async register(newUser: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username: newUser.username },
    });
    if (user) {
      throw new Error(`User ${newUser.username} already used`);
    }
    const hashPass = await bcrypt.hash(newUser.password, 10);
    const userNew = await this.userRepository.create({
      ...newUser,
      password: hashPass,
    });

    return this.userRepository.save(userNew);
  }

  async update(id: number, updatedUser: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new UnauthorizedException(`User ${id} not found`);
    }
    await this.userRepository.update(id, updatedUser);
    return user;
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new UnauthorizedException(`User ${id} not found`);
    }
    await this.userRepository.delete(id);
    return 'Deleted successfully';
  }

  async createReview(
    userId: number,
    productId: number,
    rating: number,
    comment: string,
  ): Promise<Review> {
    return this.dataSource.transaction(async (manager) => {
      const [user, product] = await Promise.all([
        manager.findOne(User, { where: { id: userId } }),
        manager.findOne(Product, { where: { id: productId } }),
      ]);
      if (!user) throw new Error('User not found');
      if (!product) throw new Error('Product not found');
      const review = manager.create(Review, {
        user,
        product,
        rating,
        comment,
      });
      await manager.save(review);
      return review;
    });
  }
}
