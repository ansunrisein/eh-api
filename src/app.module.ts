import {APP_GUARD} from '@nestjs/core'
import {Module} from '@nestjs/common'
import {GraphQLModule} from '@nestjs/graphql'
import {ConfigModule} from '@nestjs/config'
import {AuthGlobalGuard} from './auth/AuthGlobalGuard'
import {AuthService} from './auth/service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      introspection: true,
      playground: true,
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
