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
import { DataSource, Repository } from 'typeorm';

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

  async decreaseStock(items: { productId: number; quantity: number }[]) {
    return await this.dataSource.transaction(async (manager) => {
      // lay san pham duoc goi
      const productIds = items.map((item) => item.productId);

      // Lấy toàn bộ sản phẩm trong DB
      const products = await manager.findByIds(Product, productIds);

      // So sanh so luong san pham trong DB duoc tim thay qua cac id duoc truyen voi so luong cac san pham duoc truyen
      if (products.length !== productIds.length)
        throw new Error('Some products not found');

      // Kiểm tra số lượng từng sản phẩm
      products.forEach((product) => {
        const item = items.find((i) => i.productId === product.id);
        if (product.stock < item.quantity)
          throw new Error(`Not enough stock for product ID ${product.id}`);
        product.stock -= item.quantity;
      });

      // Giảm stock cho tất cả sản phẩm trong 1 lần save
      await manager.save(products);
      return products;
    });
  }
}
