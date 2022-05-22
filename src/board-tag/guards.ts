import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'

@Injectable()
export class BoardTagGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return false
  }
}
