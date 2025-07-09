import mongoose, { Schema } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

export const applyCategoryHooks = (schema: Schema) => {
  schema.post('findOneAndDelete', async function (doc) {
    if (doc) {
      const Product = mongoose.model('Product');

      // حذف المنتجات التابعة للتصنيف
      await Product.deleteMany({ categoryId: doc._id });

      // حذف صورة التصنيف من Cloudinary
      if (doc.image?.public_id) {
        try {
          await cloudinary.uploader.destroy(doc.image.public_id);
        } catch (err) {
          console.warn(`⚠️ Failed to delete category image: ${err.message}`);
        }
      }

      // حذف المجلد الخاص بالتصنيف
      if (doc.folderId) {
        try {
          await cloudinary.api.delete_resources_by_prefix(doc.folderId);
          await cloudinary.api.delete_folder(doc.folderId);
        } catch (err) {
          console.warn(`⚠️ Failed to delete folder ${doc.folderId}: ${err.message}`);
        }
      }
    }
  });
};
