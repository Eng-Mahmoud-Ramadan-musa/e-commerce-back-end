import { DBService } from "src/DB/db.service"
import { Product, TProduct } from "./product.schema"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { Injectable } from "@nestjs/common"


@Injectable()
export class ProductRepository extends DBService<TProduct> {
    constructor(@InjectModel(Product.name) private readonly productModel: Model<TProduct>) {
        super(productModel)
    }

    aggregate() {
         return this.productModel.aggregate([
    {
      $group: {
        _id: '$category', // التجميع حسب ID الكاتيجوري
        totalProducts: { $sum: 1 }, // عدّ المنتجات
        products: { $push: '$$ROOT' }, // جلب جميع المنتجات
      },
    },
    {
      $lookup: {
        from: 'categories',          // اسم الكولكشن في MongoDB
        localField: '_id',           // ID الكاتيجوري من $group
        foreignField: '_id',         // مفتاح الربط في الكاتيجوري
        as: 'category',
      },
    },
    {
      $unwind: '$category', // لتحويل مصفوفة category إلى كائن واحد
    },
    {
      $project: {
        _id: 1,
        categoryId: '$_id',
        categoryName: '$category.name',
        totalProducts: 1,
        products: 1,
      },
    },
  ]);
    }

}