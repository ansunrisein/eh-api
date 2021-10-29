import {Args, ID, Mutation, Query, Resolver} from '@nestjs/graphql'
import {UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {ParseObjectID} from '../shared/pipes'
import {AuthGuard} from '../auth/AuthGuard'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {CreateEvent, Event, UpdateEvent} from './model'
import {EventService} from './service'

@Resolver(() => Event)
export class EventResolver {
  constructor(private eventService: EventService) {}

  @Mutation(() => Event, {nullable: true})
  createEvent(
    @InjectUser() user: User | undefined,
    @Args(ParseObjectID.for('userId')) event: CreateEvent,
  ): Promise<Event | undefined> {
    return this.eventService.createEvent(user, event)
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
