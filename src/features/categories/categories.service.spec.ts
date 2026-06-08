import * as fs from 'fs';
import { CategoriesService } from './categories.service';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: {
    findOne: jest.Mock;
    deleteOne: jest.Mock;
  };

  beforeEach(() => {
    categoryModel = {
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    service = new CategoriesService(
      categoryModel as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not unlink a category image outside the categories storage directory', async () => {
    categoryModel.findOne.mockResolvedValue({
      image: 'storage/categories/../../package.json',
    });
    categoryModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
    jest.mocked(fs.existsSync).mockReturnValue(true);

    const response = await service.remove('category-slug');

    expect(categoryModel.deleteOne).toHaveBeenCalledWith({
      slug: 'category-slug',
    });
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(response.success).toBe(false);
    expect(response.message).toBe('Chemin d’image invalide');
  });
});
