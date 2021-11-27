import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {EventService} from './service'
import {BoardService} from '../board/service'

export abstract class EventGuard {
  protected static extractUserId(context: ExecutionContext): ObjectId | undefined {
    return context.getArgByIndex(2).user?._id
  }

  protected static extractEventId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.eventId || args.event?._id || args._id
    return id && new ObjectId(id)
  }
}

@Injectable()
export class CanUpdateEvent extends EventGuard implements CanActivate {
  @Inject(forwardRef(() => EventService))
  private eventService: EventService

  @Inject(forwardRef(() => BoardService))
  private boardService: BoardService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = CanUpdateEvent.extractUserId(context)
    const eventId = CanUpdateEvent.extractEventId(context)

    return this.canUpdateEvent(userId, eventId)
  }

  public async canUpdateEvent(
    userId: ObjectId | undefined,
    eventId: ObjectId | undefined,
  ): Promise<boolean> {
    if (!eventId) {
      return false
    }

    const event = await this.eventService.getById(eventId)

    if (!event) {
      return false
    }

    const board = await this.boardService.board(event.boardId)

    return board.userId.equals(userId)
  }
}

@Injectable()
export class CanGetEvent extends EventGuard implements CanActivate {
  @Inject(forwardRef(() => EventService))
  public eventService!: EventService

  @Inject(forwardRef(() => BoardService))
  public boardService!: BoardService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = CanUpdateEvent.extractUserId(context)
    const eventId = CanUpdateEvent.extractEventId(context)

    return this.canGetEvent(userId, eventId)
  }

  public async canGetEvent(
    userId: ObjectId | undefined,
    eventId: ObjectId | undefined,
  ): Promise<boolean> {
    if (!eventId) {
      return false
    }

    const event = await this.eventService.getById(eventId)

    if (!event) {
      return false
    }

    const board = await this.boardService.board(event.boardId)

    if (!board.isPrivate) {
      return true
    }

    return board.userId.equals(userId)
  }
}
