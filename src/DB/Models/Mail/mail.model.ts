import { MongooseModule } from "@nestjs/mongoose";
import { Mail, mailSchema } from "./mail.schema";

// model
export const MailModel = MongooseModule.forFeature([{name: Mail.name, schema: mailSchema}])
