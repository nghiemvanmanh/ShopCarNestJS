import { Test, TestingModule } from '@nestjs/testing';
import { OderItemController } from './oder-item.controller';
import { OderItemService } from './oder-item.service';

describe('OderItemController', () => {
  let controller: OderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OderItemController],
      providers: [OderItemService],
    }).compile();

    controller = module.get<OderItemController>(OderItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
