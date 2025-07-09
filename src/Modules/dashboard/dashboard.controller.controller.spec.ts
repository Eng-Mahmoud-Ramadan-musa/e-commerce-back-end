import { Test, TestingModule } from '@nestjs/testing';
import { DashboardControllerController } from './dashboard.controller';

describe('DashboardControllerController', () => {
  let controller: DashboardControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardControllerController],
    }).compile();

    controller = module.get<DashboardControllerController>(DashboardControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
