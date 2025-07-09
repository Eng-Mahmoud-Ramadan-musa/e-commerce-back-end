import { MongooseModule } from "@nestjs/mongoose";
import { Order, orderSchema } from "./order.schema";

// model
export const OrderModel = MongooseModule.forFeature([{name: Order.name, schema: orderSchema}])
