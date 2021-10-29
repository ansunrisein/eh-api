import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {User} from '../user/model'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const {user} = context.getArgByIndex<{user: User | undefined}>(2)

    return !!user
  }
}
