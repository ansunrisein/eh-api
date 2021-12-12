import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardLinkService} from './service'
import {BoardService} from '../board/service'
import {BoardLinkPermission} from './permissions'
import {AuthService} from '../auth/service'

@Injectable()
export class BoardLinkGuard implements CanActivate {
  permission?: BoardLinkPermission

  @Inject(forwardRef(() => BoardLinkService))
  public boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => BoardService))
  public boardService!: BoardService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = AuthService.extractUserId(context)
    const boardId = BoardService.extractBoardId(context)
    const boardLinkId = BoardLinkService.extractBoardLinkId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return boardLinkId
      ? this.hasPermissionForLink({boardLinkId, userId, linkToken})
      : this.hasPermissionForBoard({boardId, userId, linkToken})
  }

  public async hasPermissionForBoard({
    boardId,
    userId,
    linkToken,
  }: {
    boardId?: ObjectId
    userId?: ObjectId
    linkToken?: string
  }): Promise<boolean> {
    if (!userId && this.permission !== BoardLinkPermission.VIEW_BOARD_LINK) {
      return false
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

    if (!linkToken) {
      return false
    }

    const myLink = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!myLink) {
      return false
    }

    return !!this.permission && myLink.permissions.includes(this.permission)
  }

  public async hasPermissionForLink({
    boardLinkId,
    userId,
    linkToken,
  }: {
    boardLinkId?: ObjectId
    userId?: ObjectId
    linkToken?: string
  }) {
    if (!userId && this.permission !== BoardLinkPermission.VIEW_BOARD_LINK) {
      return false
    }

    if (!boardLinkId) {
      return false
    }

    const link = await this.boardLinkService.getBoardLink(boardLinkId)

    if (!link) {
      return false
    }

    return this.hasPermissionForBoard({
      boardId: link.boardId,
      userId,
      linkToken,
    })
  }

  static for(permission: BoardLinkPermission) {
    return mixin(
      class extends BoardLinkGuard {
        permission: BoardLinkPermission = permission
      },
    )
  }
}
