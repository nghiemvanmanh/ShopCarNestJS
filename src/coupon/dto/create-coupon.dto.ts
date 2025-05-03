import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { CouponUnit } from 'src/common/enums/coupon-unit.enum';

export class CreateCouponDto {
  id: number;
  @IsNumber()
  value: number;
  description: string;
  @IsEnum(CouponUnit)
  unit: CouponUnit;
  @IsNumber()
  quantity: number;
  @IsBoolean()
  is_active: boolean;
}
