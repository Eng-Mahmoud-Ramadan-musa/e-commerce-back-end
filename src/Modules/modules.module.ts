import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SellerModule } from "./seller/seller.module";
import { PublicModule } from "./public/public.module";
import { GatewayModule } from "./gateway/gateway.module";

@Module({
  imports: [UserModule, AuthModule, DashboardModule, SellerModule, PublicModule, GatewayModule],
})
export class Modules {}