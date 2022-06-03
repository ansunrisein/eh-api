import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, mixin} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from '../board/service'
import {BoardLinkService} from '../board-link/service'
import {AuthService} from '../auth/service'
import {EventService} from './service'
import {EventPermission} from './permissions'

@Injectable()
export class EventGuard implements CanActivate {
  permission?: EventPermission

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => EventService))
  private eventService!: EventService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = AuthService.extractUserId(context)
    const eventIds = EventService.extractEventIds(context)
    const boardId = BoardService.extractBoardId(context)
    const linkToken = BoardLinkService.extractLinkToken(context)

    return boardId
      ? this.hasPermissionForBoard({boardId, userId, linkToken})
      : this.hasPermissionForEvent({eventIds, userId, linkToken})
  }

  public async hasPermissionForBoard({
    boardId,
    userId,
    linkToken,
    permission = this.permission,
  }: {
    boardId?: ObjectId
    userId?: ObjectId
    linkToken?: string
    permission?: EventPermission
  }) {
    if (!permission) {
      throw new Error('You forgot to pass permission into EventGuard')
    }

    if (!userId && permission !== EventPermission.VIEW_EVENT) {
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

    if (!board.isPrivate && permission === EventPermission.VIEW_EVENT) {
      return true
    }

    if (!linkToken) {
      return false
    }

    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return false
    }

    return !!permission && link.permissions.includes(permission)
  }

  public async hasPermissionForEvent({
    eventIds,
    userId,
    linkToken,
    permission = this.permission,
  }: {
    eventIds?: ObjectId[]
    userId?: ObjectId
    linkToken?: string
    permission?: EventPermission
  }) {
    if (!permission) {
      throw new Error('You forgot to pass permission into EventGuard')
    }

    if (!userId && permission !== EventPermission.VIEW_EVENT) {
      return false
    }

    if (!eventIds?.length) {
      return false
    }

    const events = await this.eventService.getEventsByIds(eventIds)

    if (!events.length) {
      return false
    }

    const boardIds = events
      .map(e => e.boardId)
      .filter((id, index, ids) => ids.slice(index + 1).every(e => !e.equals(id)))

    if (boardIds.length !== 1) {
      return false
    }

    return this.hasPermissionForBoard({boardId: boardIds[0], userId, linkToken})
  }

  static for(permission: EventPermission) {
    return mixin(
      class extends EventGuard {
        permission: EventPermission = permission
      },
    )
  }
}
