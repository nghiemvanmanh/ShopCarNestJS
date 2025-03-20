import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'database/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createProduct(addProduct: CreateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { name: addProduct.name },
    });
    if (product) {
      product.stock += addProduct.stock;
      return await this.productRepository.save(product);
    }
    const newProduct = await this.productRepository.create(addProduct);
    return await this.productRepository.save(newProduct);
  }

  async updateProduct(
    id: number,
    updatedProduct: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      throw new UnauthorizedException('Product not found');
    }
    await this.productRepository.update(id, updatedProduct);
    return this.productRepository.findOne({ where: { id: id } });
  }

  async deleteProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      throw new UnauthorizedException('Product not found');
    }
    return this.productRepository.delete(id);
  }
}
