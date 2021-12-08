import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardLinkService} from './service'
import {BoardService} from '../board/service'
import {BoardLinkPermission} from './permissions'
import {AuthService} from '../auth/service'

@Injectable()
export class BoardLinkGuard implements CanActivate {
  permissions: BoardLinkPermission[] = []

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
      ? this.hasPermissionsForLink(boardLinkId, userId, linkToken)
      : this.hasPermissionsForBoard(boardId, userId, linkToken)
  }

  public async hasPermissionsForBoard(
    boardId?: ObjectId,
    userId?: ObjectId,
    linkToken?: string,
  ): Promise<boolean> {
    if (!userId && !this.permissions.every(perm => perm === BoardLinkPermission.VIEW_BOARD_LINK)) {
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

    return this.permissions.every(perm => myLink.permissions.includes(perm))
  }

  public async hasPermissionsForLink(linkId?: ObjectId, userId?: ObjectId, linkToken?: string) {
    if (!userId && !this.permissions.every(perm => perm === BoardLinkPermission.VIEW_BOARD_LINK)) {
      return false
    }

    if (!linkId) {
      return false
    }

    const link = await this.boardLinkService.getBoardLink(linkId)

    if (!link) {
      return false
    }

    return this.hasPermissionsForBoard(link.boardId, userId, linkToken)
  }

  static for(permissions: BoardLinkPermission | BoardLinkPermission[]) {
    return mixin(
      class extends BoardLinkGuard {
        permissions: BoardLinkPermission[] = Array.isArray(permissions)
          ? permissions
          : [permissions]
      },
    )
  }
}
