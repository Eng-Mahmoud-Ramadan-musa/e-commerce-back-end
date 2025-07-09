import { MongooseModule } from '@nestjs/mongoose';
import { Category, categorySchema } from './category.schema';
import { applyCategoryHooks } from './category.hooks';

export const CategoryModel = MongooseModule.forFeatureAsync([
  {
    name: Category.name,
    useFactory: () => {
      applyCategoryHooks(categorySchema);
      return categorySchema;
    },
  },
]);
