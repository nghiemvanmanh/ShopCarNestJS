import { Module } from '@nestjs/common';
import { OderItemService } from './oder-item.service';
import { OderItemController } from './oder-item.controller';

@Module({
  controllers: [OderItemController],
  providers: [OderItemService]
})
export class OderItemModule {}
