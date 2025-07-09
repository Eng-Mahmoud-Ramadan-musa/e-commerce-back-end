import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { decrypt, encrypt, hash } from '../../../Common';
import { TUser } from './user.schema';

export const addUserHooks = (schema: Schema) => {
  schema.pre('save', function (this: HydratedDocument<TUser>, next) {
    if (this.isModified('password') && this.password) {
      this.password = hash(this.password);
    }
    if (this.isModified('phone') && this.phone) {
      this.phone = encrypt(this.phone);
    }
    next();
  });

  const decryptPhone = (doc: TUser) => {
    if (doc && doc.phone) {
      doc.phone = decrypt(doc.phone);
    }
  };

  schema.post('find', function (docs) {
    docs.forEach(decryptPhone);
  });

  schema.post('findOne', decryptPhone);

  schema.post('findOneAndDelete', async function (doc) {
    if (doc) {
      const userId = doc._id;

      const ProductModel = mongoose.model('Product');
      const CategoryModel = mongoose.model('Category');
      const OrderModel = mongoose.model('Order');

      await Promise.all([
        ProductModel.deleteMany({ createdBy: userId }),
        CategoryModel.deleteMany({ createdBy: userId }),
        OrderModel.deleteMany({ userId }),
      ]);

    }
  });
};
