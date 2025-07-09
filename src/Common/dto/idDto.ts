import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class IdDto {
    @IsNotEmpty()
    @IsMongoId()
    id: Types.ObjectId;
}
