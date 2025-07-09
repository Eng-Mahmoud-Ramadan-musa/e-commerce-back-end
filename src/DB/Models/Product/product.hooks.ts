import mongoose, { Schema } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

export const applyProductHooks = (schema: Schema) => {
  schema.post('findOneAndDelete', async function (doc) {
    if (doc) {
      const productId = doc._id;

      const Cart = mongoose.model('Cart');
      const Order = mongoose.model('Order');

      // حذف المنتج من الكارت والطلبات
      await Promise.all([
        Cart.updateMany({}, { $pull: { products: { productId } } }),
        Order.updateMany({}, { $pull: { products: { productId } } }),
      ]);

      // حذف الصور من Cloudinary
      if (doc.images?.length) {
        for (const img of doc.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      // حذف كل الصور داخل المجلد
      if (doc.folderId) {
        try {
          await cloudinary.api.delete_resources_by_prefix(doc.folderId);
          await cloudinary.api.delete_folder(doc.folderId);
        } catch (err) {
          console.warn(`⚠️ Could not delete folder ${doc.folderId}:`, err.message);
        }
      }
    }
  });
};
