import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { AuthGuard } from '../auth/AuthGuard';
import { EventService } from './service';
import { ParseObjectID } from '../ParseObjectID';
import { ConnectionInterceptor } from '../pagination/ConnectionInterceptor';
import { Page } from '../pagination/Page';
import { CreateEvent, Event, EventConnection, UpdateEvent } from './model';
import { CanUpdateEvent } from './guards';
import { Board } from '../board/model';
import { BoardService } from '../board/service';

@Resolver(() => Event)
export class EventResolver {
  constructor(
    private eventService: EventService,
    private boardService: BoardService,
  ) {}

  @ResolveField(() => Board)
  board(@Parent() event: Event): Promise<Board | undefined> {
    return this.boardService.board(event.boardId);
  }

  @Query(() => Event, { nullable: true })
  event(
    @Args('_id', { type: () => ID }, ParseObjectID) _id: ObjectID,
  ): Promise<Event | undefined> {
    return this.eventService.getById(_id);
  }

  @Query(() => EventConnection)
  @UseInterceptors(ConnectionInterceptor)
  async events(
    @Args('boardId', { type: () => ID }, ParseObjectID) boardId: ObjectID,
    @Args('page') page: Page,
  ) {
    return this.eventService.getEventsByBoardId(boardId, page);
  }

  @Mutation(() => Event, { nullable: true })
  @UseGuards(AuthGuard)
  createEvent(
    @Args(ParseObjectID.for('boardId')) event: CreateEvent,
  ): Promise<Event | undefined> {
    return this.eventService.createEvent(event);
  }

  @Mutation(() => Event, { nullable: true })
  @UseGuards(AuthGuard)
  removeEvent(
    @Args('_id', { type: () => ID }, ParseObjectID) _id: ObjectID,
  ): Promise<Event | undefined> {
    return this.eventService.removeEvent(_id);
  }

  @Mutation(() => Event, { nullable: true })
  @UseGuards(CanUpdateEvent)
  updateEvent(
    @Args(ParseObjectID.for('_id')) event: UpdateEvent,
  ): Promise<Event | undefined> {
    return this.eventService.updateEvent(event);
  }
}
