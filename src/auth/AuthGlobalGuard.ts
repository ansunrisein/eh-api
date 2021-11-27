import {CanActivate, ExecutionContext, Inject, Injectable} from '@nestjs/common'
import {AuthService} from './service'

@Injectable()
export class AuthGlobalGuard implements CanActivate {
  @Inject(AuthService)
  private authService: AuthService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const graphqlContext = context.getArgByIndex(2)

    graphqlContext.token = graphqlContext.req.header('Authorization')?.slice(7)
    graphqlContext.user = await this.authService.authenticate(graphqlContext.token)

    return true
  }
}
