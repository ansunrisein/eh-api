import {APP_GUARD} from '@nestjs/core'
import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {GraphQLModule} from '@nestjs/graphql'
import {ConfigModule} from '@nestjs/config'
import {AuthGlobalGuard} from './auth/AuthGlobalGuard'
import {AuthService} from './auth/service'
import {UserModule} from './user/module'
import {EventModule} from './event/module'
import {BoardModule} from './board/module'

@Module({
  imports: [
    ConfigModule.forRoot(),
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
      introspection: true,
      playground: true,
      autoSchemaFile: true,
      cors: {
        origin: '*',
      },
      fieldResolverEnhancers: ['guards', 'interceptors'],
    }),
    UserModule,
    EventModule,
    BoardModule,
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
