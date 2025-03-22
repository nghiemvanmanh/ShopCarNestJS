import { PartialType } from '@nestjs/mapped-types';
import { CreateOderItemDto } from './create-oder-item.dto';

export class UpdateOderItemDto extends PartialType(CreateOderItemDto) {}
