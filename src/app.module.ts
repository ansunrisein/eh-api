import {Module} from '@nestjs/common'
import {GraphQLModule} from '@nestjs/graphql'

@Module({
  imports: [
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
})
export class AppModule {}
