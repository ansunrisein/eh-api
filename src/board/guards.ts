import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from './service'
import {BoardLinkService} from '../board-link/service'
import {BoardPermission} from './permissions'
import {AuthService} from '../auth/service'
import {SubService} from '../sub/service'

@Injectable()
export class BoardGuard implements CanActivate {
  permission?: BoardPermission

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => SubService))
  private subService!: SubService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = AuthService.extractUserId(context)
    const boardId = BoardService.extractBoardId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return this.hasPermission({boardId, userId, linkToken})
  }

  public async hasPermission({
    boardId,
    userId,
    linkToken,
    permission = this.permission,
  }: {
    boardId?: ObjectId
    userId?: ObjectId
    linkToken?: string
    permission?: BoardPermission
  }) {
    if (!permission) {
      throw new Error('You forgot to pass permission into BoardGuard')
    }

    if (!userId && permission !== BoardPermission.VIEW_BOARD) {
      return false
    }

    if (!boardId && permission === BoardPermission.CREATE_BOARD && userId) {
      return true
    }

    if (!boardId) {
      return false
    }

    const board = await this.boardService.board(boardId)

    if (!board) {
      return false
    }

    if (userId?.equals(board.userId)) {
      return true
    }

    const sub = await this.subService.getSubByBoardAndUser({boardId: board._id, userId})

    if (sub) {
      return true
    }

    if (!board.isPrivate && permission === BoardPermission.VIEW_BOARD) {
      return true
    }

    if (!linkToken) {
      return false
    }

    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return false
    }

    return (
      BoardLinkService.isAvailablePermission(permission) && link.permissions.includes(permission)
    )
  }

  static for(permission: BoardPermission) {
    return mixin(
      class extends BoardGuard {
        permission: BoardPermission = permission
      },
    )
  }
}
