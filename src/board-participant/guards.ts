import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {BoardLinkService} from '../board-link/service'
import {BoardParticipantPermission} from './permissions'

@Injectable()
export class BoardParticipantGuard implements CanActivate {
  permission?: BoardParticipantPermission

  @Inject(forwardRef(() => BoardLinkService))
  public boardLinkService!: BoardLinkService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const linkToken = BoardLinkService.extractLinkToken(context)

    return this.hasPermission({linkToken})
  }

  public async hasPermission({
    linkToken,
    permission = this.permission,
  }: {
    linkToken?: string
    permission?: BoardParticipantPermission
  }): Promise<boolean> {
    if (!permission) {
      throw new Error('You forgot to pass permission into BoardParticipantGuard')
    }

    if (!linkToken) {
      return false
    }

    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return false
    }

    return link.allowParticipation
  }

  static for(permission: BoardParticipantPermission) {
    return mixin(
      class extends BoardParticipantGuard {
        permission: BoardParticipantPermission = permission
      },
    )
  }
}
