import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'database/entities/product.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
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

  async decreaseStock(
    manager: EntityManager,
    items: { productId: number; quantity: number }[],
  ) {
    const productMap = new Map(
      items.map((item) => [item.productId, item.quantity]),
    );
    const products = await manager.findByIds(Product, [...productMap.keys()]);
    if (products.length !== productMap.size)
      throw new NotFoundException('Some products not found');
    products.forEach((product) => {
      const quantity = productMap.get(product.id);
      if (product.stock < quantity)
        throw new BadRequestException(
          `Not enough stock for product ID ${product.id}`,
        );
      product.stock -= quantity;
    });
    await manager.save(products);
    return products;
  }

  async getListProducts() {
    return this.productRepository.find();
  }

  async getAllProductNames(): Promise<{ id: number; name: string }[]> {
    return await this.productRepository.find({
      select: ['id', 'name'],
    });
  }
}
