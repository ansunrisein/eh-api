import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { AuthGlobalGuard } from './auth/AuthGlobalGuard';
import { BoardModule } from './board/module';
import { EventModule } from './event/module';
import { UserModule } from './user/module';
import { AuthService } from './auth/service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    BoardModule,
    EventModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mongodb',
        url: process.env.DATABASE_URL,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        entities: ['dist/**/model.js'],
      }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      cors: {
        origin: '*',
      },
      fieldResolverEnhancers: ['guards', 'interceptors'],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGlobalGuard,
    },
    AuthService,
  ],
})
export class AppModule {}
