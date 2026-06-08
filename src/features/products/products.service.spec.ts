import * as fs from 'fs';
import { ProductsService } from './products.service';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: {
    findOneAndDelete: jest.Mock;
  };

  beforeEach(() => {
    productModel = {
      findOneAndDelete: jest.fn(),
    };

    service = new ProductsService(productModel as any, {} as any, {} as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not unlink a product image outside the products storage directory', async () => {
    productModel.findOneAndDelete.mockResolvedValue({
      images: [{ url: 'storage/products/../../package.json' }],
    });
    jest.mocked(fs.existsSync).mockReturnValue(true);

    const response = await service.remove('product-slug');

    expect(productModel.findOneAndDelete).toHaveBeenCalledWith({
      slug: 'product-slug',
    });
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(response.success).toBe(false);
    expect(response.message).toBe('Chemin d’image invalide');
  });
});
