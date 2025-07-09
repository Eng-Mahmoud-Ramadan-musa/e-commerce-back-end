import { MongooseModule } from "@nestjs/mongoose";
import { TUser, User, userSchema } from "./user.schema";
import { addUserHooks } from "./user.hook";
// model
export const UserModel = MongooseModule.forFeatureAsync([
    {
        name: User.name,
        useFactory: () => {
            addUserHooks(userSchema);
            return userSchema;
        }
    }
])
