import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from 'mongoose';
import { DBService } from "../../db.service";
import { TUser, User } from "./user.schema";

@Injectable()
export class UserRepository extends DBService<TUser> {
    constructor(@InjectModel('User') private readonly userModel: Model<TUser>) {
        super(userModel)
    }

    userExist(email: string): Promise<TUser | null> {
        return this.findOne({ filter: { email: new RegExp(`^${email}$`, 'i') } })
    }
}