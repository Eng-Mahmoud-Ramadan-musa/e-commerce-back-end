import { DBService } from "src/DB/db.service";
import { TMail, Mail } from "./mail.schema";
import { Model } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailRepository extends DBService<TMail> {
    constructor(@InjectModel(Mail.name) private readonly mailModel: Model<TMail>) {
        super(mailModel)
    }

}