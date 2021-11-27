import {CanActivate, ExecutionContext, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardLinkService} from './service'
import {BoardService} from '../board/service'
import {BoardLinkPermission} from './permissions'

export abstract class BoardLinkGuardUtils {
  static extractUserId(context: ExecutionContext): ObjectId | undefined {
    return context.getArgByIndex(2).user?._id
  }

  static extractBoardLinkId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardLinkId || args.boardLink?._id || args._id
    return id && new ObjectId(id)
  }

  static extractLinkToken(context: ExecutionContext): string | undefined {
    const args = context.getArgByIndex(1)
    return args.linkToken || args.boardLink?.token
  }

  static extractBoardId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardId || args.board?._id || args._id
    return id && new ObjectId(id)
  }
}

@Injectable()
export class BoardLinkGuard implements CanActivate {
  permissions: BoardLinkPermission[] = []

  constructor(public boardLinkService: BoardLinkService, public boardService: BoardService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = BoardLinkGuardUtils.extractUserId(context)
    const boardId = BoardLinkGuardUtils.extractBoardId(context)
    const boardLinkId = BoardLinkGuardUtils.extractBoardLinkId(context)
    const linkToken = BoardLinkGuardUtils.extractLinkToken(context)

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
