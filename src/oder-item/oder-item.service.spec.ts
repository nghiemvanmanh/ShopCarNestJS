import { Test, TestingModule } from '@nestjs/testing';
import { OderItemService } from './oder-item.service';

describe('OderItemService', () => {
  let service: OderItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OderItemService],
    }).compile();

    service = module.get<OderItemService>(OderItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
