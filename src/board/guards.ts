import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from './service'
import {BoardLinkService} from '../board-link/service'
import {BoardPermission} from './permissions'
import {AuthService} from '../auth/service'

@Injectable()
export class BoardGuard implements CanActivate {
  permission?: BoardPermission

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = AuthService.extractUserId(context)
    const boardId = BoardService.extractBoardId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return this.hasPermission(boardId, userId, linkToken)
  }

  public async hasPermission(boardId?: ObjectId, userId?: ObjectId, linkToken?: string) {
    if (!userId && this.permission !== BoardPermission.VIEW_BOARD) {
      return false
    }

    if (!boardId && this.permission === BoardPermission.CREATE_BOARD && userId) {
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

    if (!board.isPrivate && this.permission === BoardPermission.VIEW_BOARD) {
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
      BoardLinkService.isAvailablePermission(this.permission) &&
      link.permissions.includes(this.permission)
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
