import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Modules } from './Modules/modules.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    MongooseModule.forRoot(process.env.DB_URL as string),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/common/graphql/schema.gql'),
      playground: true,
    }),
    // CacheModule.register({
    //   isGlobal: true
    // }),
    // CacheModule.registerAsync({
    //   useFactory: async () => {
    //     return {
    //       store: createKeyv(process.env.REDIS_URL),
    //     }
    //   },
    //   isGlobal: true,
    // }),
    Modules
  ],
})
export class AppModule {}
