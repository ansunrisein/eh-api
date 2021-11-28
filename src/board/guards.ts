import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from './service'
import {BoardLinkService} from '../board-link/service'
import {BoardPermission} from './permissions'
import {AuthService} from '../auth/service'

@Injectable()
export class BoardGuard implements CanActivate {
  permissions: BoardPermission[] = []

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = AuthService.extractUserId(context)
    const boardId = BoardService.extractBoardId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return this.hasPermissions(boardId, userId, linkToken)
  }

  public async hasPermissions(boardId?: ObjectId, userId?: ObjectId, linkToken?: string) {
    if (
      !boardId &&
      this.permissions.every(perm => perm === BoardPermission.CREATE_BOARD) &&
      userId
    ) {
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

    if (!board.isPrivate && this.permissions.every(perm => perm === BoardPermission.VIEW_BOARD)) {
      return true
    }

    if (!linkToken) {
      return false
    }

    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return false
    }

    return this.permissions.every(perm => link.permissions.includes(perm))
  }

  static for(permissions: BoardPermission | BoardPermission[]) {
    return mixin(
      class extends BoardGuard {
        permissions: BoardPermission[] = Array.isArray(permissions) ? permissions : [permissions]
      },
    )
  }
}
