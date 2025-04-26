import { IsString, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 },
    { message: 'Price must be a valid decimal with up to 2 decimal places' },
  )
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsInt({ message: 'Stock must be an integer' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @IsString()
  @IsNotEmpty()
  image: string;
}
