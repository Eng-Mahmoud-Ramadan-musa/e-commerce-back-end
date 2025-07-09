import { DBService } from "src/DB/db.service";
import { TCategory, Category } from "./category.schema";
import { Document, Model, Types } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryRepository extends DBService<TCategory> {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<TCategory>) {
        super(categoryModel)
    }



}