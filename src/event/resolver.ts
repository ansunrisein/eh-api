import {Args, ID, Mutation, Query, Resolver} from '@nestjs/graphql'
import {UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {ParseObjectID} from '../shared/pipes'
import {CreateEvent, Event, UpdateEvent} from './model'
import {EventService} from './service'
import {AuthGuard} from '../auth/AuthGuard'

@Resolver(() => Event)
export class EventResolver {
  constructor(private eventService: EventService) {}

  @Mutation(() => Event, {nullable: true})
  createEvent(@Args(ParseObjectID.for('userId')) event: CreateEvent): Promise<Event | undefined> {
    return this.eventService.createEvent(event)
  }

  @Query(() => Event, {nullable: true})
  event(@Args('_id', {type: () => ID}, ParseObjectID) _id: ObjectId): Promise<Event | undefined> {
    return this.eventService.getById(_id)
  }

  @Mutation(() => Event, {nullable: true})
  @UseGuards(AuthGuard)
  removeEvent(
    @Args('_id', {type: () => ID}, ParseObjectID) _id: ObjectId,
  ): Promise<Event | undefined> {
    return this.eventService.removeEvent(_id)
  }

  @Mutation(() => Event, {nullable: true})
  updateEvent(@Args(ParseObjectID.for('_id')) event: UpdateEvent): Promise<Event | undefined> {
    return this.eventService.updateEvent(event)
  }
}
