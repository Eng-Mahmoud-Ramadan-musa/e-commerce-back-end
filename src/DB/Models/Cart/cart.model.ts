import { MongooseModule } from "@nestjs/mongoose";
import { Cart, cartSchema } from "./cart.schema";

// model
export const CartModel = MongooseModule.forFeature([{name: Cart.name, schema: cartSchema}])
