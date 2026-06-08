import * as fs from 'fs';
import { SlidersService } from './sliders.service';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('SlidersService', () => {
  let service: SlidersService;
  let sliderModel: {
    findById: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };

  beforeEach(() => {
    sliderModel = {
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    service = new SlidersService(sliderModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not unlink a slider image outside the sliders storage directory', async () => {
    sliderModel.findById.mockResolvedValue({
      image: 'storage/sliders/../../package.json',
    });
    sliderModel.findByIdAndDelete.mockResolvedValue({ deletedCount: 1 });
    jest.mocked(fs.existsSync).mockReturnValue(true);

    const response = await service.remove('slider-id');

    expect(sliderModel.findByIdAndDelete).toHaveBeenCalledWith('slider-id');
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(response.success).toBe(false);
    expect(response.message).toBe('Chemin d’image invalide');
  });
});
