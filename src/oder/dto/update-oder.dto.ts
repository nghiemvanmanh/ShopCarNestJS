import { PartialType } from '@nestjs/mapped-types';
import { CreateOderDto } from './create-oder.dto';

export class UpdateOderDto extends PartialType(CreateOderDto) {}
