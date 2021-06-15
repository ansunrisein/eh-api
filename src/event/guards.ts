import { ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from '../user/service';
import { EventService } from './service';
import { ObjectID } from 'mongodb';
import { CanUpdateBoard } from '../board/CanUpdateBoard';
import { BoardService } from '../board/service';

@Injectable()
export class CanUpdateEvent extends CanUpdateBoard {
  constructor(
    userService: UserService,
    private eventService: EventService,
    boardService: BoardService,
  ) {
    super(userService, boardService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = CanUpdateEvent.extractUserId(context);
    const eventId = CanUpdateEvent.extractEventId(context);

    return this.canUpdateEvent(userId, eventId);
  }

  public async canUpdateEvent(
    userId: ObjectID,
    eventId: ObjectID,
  ): Promise<boolean> {
    const event = await this.eventService.getById(eventId);

    return this.canUpdateBoard(userId, event.boardId);
  }

  private static extractEventId(
    context: ExecutionContext,
  ): ObjectID | undefined {
    const args = context.getArgByIndex(1);
    const id = args.eventId || args.event?._id || args._id;
    return id && new ObjectID(id);
  }
}
