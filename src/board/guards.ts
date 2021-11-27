import {CanActivate, ExecutionContext, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from './service'
import {BoardLinkService} from '../board-link/service'
import {BoardPermission} from './permissions'

export class BoardGuardUtils {
  static extractUserId(context: ExecutionContext): ObjectId | undefined {
    return context.getArgByIndex(2).user?._id
  }

  static extractBoardId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardId || args.board?._id || args._id
    return id && new ObjectId(id)
  }

  static extractLinkToken(context: ExecutionContext): string | undefined {
    const args = context.getArgByIndex(1)
    return args.linkToken || args.boardLink?.token
  }
}

@Injectable()
export class BoardGuard implements CanActivate {
  permissions: BoardPermission[] = []

  constructor(private boardService: BoardService, private boardLinkService: BoardLinkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = BoardGuardUtils.extractUserId(context)
    const boardId = BoardGuardUtils.extractBoardId(context)
    const linkToken = BoardGuardUtils.extractLinkToken(context)

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

    if (board.userId.equals(userId)) {
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
