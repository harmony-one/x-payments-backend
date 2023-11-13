import { Test, TestingModule } from '@nestjs/testing';
import { AppstoreService } from './appstore.service';

describe('AppstoreService', () => {
  let service: AppstoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppstoreService],
    }).compile();

    service = module.get<AppstoreService>(AppstoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
