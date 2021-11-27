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
      ? this.hasPermissionsForLink(userId, boardLinkId, linkToken)
      : this.hasPermissionsForBoard(userId, boardId, linkToken)
  }

  public async hasPermissionsForBoard(
    userId: ObjectId,
    boardId: ObjectId,
    linkToken?: string,
  ): Promise<boolean> {
    const board = await this.boardService.board(boardId)

    if (!board) {
      return false
    }

    if (userId.equals(board.userId)) {
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

  public async hasPermissionsForLink(userId: ObjectId, linkId: ObjectId, linkToken?: string) {
    if (!linkId) {
      return false
    }

    const link = await this.boardLinkService.boardLink(linkId)

    if (!link) {
      return false
    }

    return this.hasPermissionsForBoard(userId, link.boardId, linkToken)
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
