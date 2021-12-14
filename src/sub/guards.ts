import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {SubService} from './service'
import {ObjectId} from 'mongodb'
import {BoardLinkService} from '../board-link/service'
import {BoardService} from '../board/service'
import {SubPermission} from './permissions'
import {AuthService} from '../auth/service'
import {BoardGuard} from '../board/guards'
import {BoardPermission} from '../board/permissions'

@Injectable()
export class SubGuard implements CanActivate {
  permission?: SubPermission

  @Inject(forwardRef(() => SubService))
  subService!: SubService

  @Inject(forwardRef(() => BoardService))
  boardService!: BoardService

  @Inject(forwardRef(() => BoardGuard))
  boardGuard!: BoardGuard

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const subId = SubService.extractSubId(context)
    const userId = AuthService.extractUserId(context)
    const boardId = BoardService.extractBoardId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return this.hasPermission({subId, userId, boardId, linkToken})
  }

  async hasPermission({
    subId,
    userId,
    boardId,
    linkToken,
    permission = this.permission,
  }: {
    subId?: ObjectId
    userId?: ObjectId
    boardId?: ObjectId
    linkToken?: string
    permission?: SubPermission
  }) {
    if (!permission) {
      throw new Error('You forgot to pass permission into SubGuard')
    }

    switch (permission) {
      case SubPermission.CREATE_SUB: {
        if (!userId || !boardId) {
          return false
        }

        const board = await this.boardService.board(boardId)

        if (!board) {
          return false
        }

        if (board.userId.equals(userId)) {
          return false
        }

        return this.boardGuard.hasPermission({
          boardId,
          userId,
          linkToken,
          permission: BoardPermission.VIEW_BOARD,
        })
      }

      case SubPermission.REMOVE_SUB: {
        if (!subId || !userId) {
          return false
        }

        const sub = await this.subService.getSubById(subId)

        if (!sub) {
          return false
        }

        return sub.userId.equals(userId)
      }

      default:
        return false
    }
  }

  static for(permission: SubPermission) {
    return mixin(
      class extends SubGuard {
        permission: SubPermission = permission
      },
    )
  }
}
