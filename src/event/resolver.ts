import {Args, ID, Mutation, Query, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {ParseObjectID} from '../shared/pipes'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {CreateEvent, Event, RemoveEvents, UpdateEvent} from './model'
import {EventService} from './service'
import {EventGuard} from './guards'
import {EventPermission} from './permissions'

@Resolver(() => Event)
export class EventResolver {
  @Inject(forwardRef(() => EventService))
  private eventService!: EventService

  @Query(() => Event, {nullable: true})
  @UseGuards(EventGuard.for(EventPermission.VIEW_EVENT))
  event(
    @Args('eventId', {type: () => ID}, ParseObjectID) eventId: ObjectId,
  ): Promise<Event | undefined> {
    return this.eventService.getById(eventId)
  }

  @Query(() => [Event], {nullable: true})
  @UseGuards(EventGuard.for(EventPermission.VIEW_EVENT))
  timeExpiredEvents(
    @Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId,
  ): Promise<Event[] | undefined> {
    return this.eventService.getTimeExpiredEventsByBoardId(boardId)
  }

  @Mutation(() => Event, {nullable: true})
  @UseGuards(EventGuard.for(EventPermission.CREATE_EVENT))
  createEvent(
    @InjectUser() user: User,
    @Args('event', {type: () => CreateEvent}, ParseObjectID.for('boardId')) event: CreateEvent,
  ): Promise<Event | undefined> {
    return this.eventService.createEvent(user, event)
  }

  @Mutation(() => Event, {nullable: true})
  @UseGuards(EventGuard.for(EventPermission.UPDATE_EVENT))
  updateEvent(
    @Args('event', {type: () => UpdateEvent}, ParseObjectID.for('_id')) event: UpdateEvent,
  ): Promise<Event | undefined> {
    return this.eventService.updateEvent(event)
  }

  @Mutation(() => Event, {nullable: true})
  @UseGuards(EventGuard.for(EventPermission.REMOVE_EVENT))
  removeEvent(
    @Args('eventId', {type: () => ID}, ParseObjectID) eventId: ObjectId,
  ): Promise<Event | undefined> {
    return this.eventService.removeEvent(eventId)
  }

  @Mutation(() => [Event], {nullable: true})
  @UseGuards(EventGuard.for(EventPermission.REMOVE_EVENT))
  removeEventsByIds(
    @Args('events', {type: () => RemoveEvents}, ParseObjectID.for('ids')) events: RemoveEvents,
  ): Promise<Event[] | undefined> {
    return this.eventService.removeEventsByIds(events.ids)
  }
}
