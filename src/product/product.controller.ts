import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { Public } from 'src/auth/decorators/custompublic';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AdminGuard)
  @Post('create')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @UseGuards(AdminGuard)
  @Put('update/:id')
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @UseGuards(AdminGuard)
  @Delete('delete')
  delete(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }

  @Public()
  @Get('getProduct')
  getList() {
    return this.productService.getListProducts();
  }
}
