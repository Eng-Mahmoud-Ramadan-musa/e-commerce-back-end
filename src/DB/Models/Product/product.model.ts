import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from './product.schema';
import { applyProductHooks } from './product.hooks';

export const ProductModel = MongooseModule.forFeatureAsync([
  {
    name: Product.name,
    useFactory: () => {
      applyProductHooks(productSchema);
      return productSchema;
    },
  },
]);
