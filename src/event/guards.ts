import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from '../board/service'
import {BoardLinkService} from '../board-link/service'
import {AuthService} from '../auth/service'
import {EventService} from './service'
import {EventPermission} from './permissions'

@Injectable()
export class EventGuard implements CanActivate {
  permissions: EventPermission[] = []

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => EventService))
  private eventService!: EventService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = AuthService.extractUserId(context)
    const eventId = EventService.extractEventId(context)
    const boardId = BoardService.extractBoardId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return boardId
      ? this.hasPermissionsForBoard(boardId, userId, linkToken)
      : this.hasPermissionsForEvent(eventId, userId, linkToken)
  }

  public async hasPermissionsForBoard(boardId?: ObjectId, userId?: ObjectId, linkToken?: string) {
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

    if (!board.isPrivate && this.permissions.every(perm => perm === EventPermission.VIEW_EVENT)) {
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

  public async hasPermissionsForEvent(eventId?: ObjectId, userId?: ObjectId, linkToken?: string) {
    if (!eventId) {
      return false
    }

    const event = await this.eventService.getById(eventId)

    if (!event) {
      return false
    }

    return this.hasPermissionsForBoard(event.boardId, userId, linkToken)
  }

  static for(permissions: EventPermission | EventPermission[]) {
    return mixin(
      class extends EventGuard {
        permissions: EventPermission[] = Array.isArray(permissions) ? permissions : [permissions]
      },
    )
  }
}
