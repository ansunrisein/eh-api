import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql'
import {ObjectId} from 'mongodb'
import {Connection} from '../pagination/model'
import {Sort} from '../shared/sort'
import {EventFilter} from './event-filter'

export type EventCursor = {
  _id: string | ObjectId
  deadline?: Date
}

@ObjectType()
@Entity({name: 'events'})
export class Event extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  userId!: ObjectId

  @Column()
  boardId!: ObjectId

  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Field(() => String)
  @Column()
  content!: string

  @Field(() => Date, {nullable: true})
  @Column()
  deadline?: Date

  _cursor?: EventCursor
}

@ObjectType()
export class EventEdge {
  @Field(() => String)
  cursor!: string

  @Field(() => Event)
  node!: Event
}

@ObjectType()
export class EventConnection extends Connection<Event> {
  @Field(() => [EventEdge])
  edges!: EventEdge[]
}

@InputType()
export class CreateEvent extends BaseEntity {
  @Field(() => ID)
  @Column()
  boardId!: ObjectId

  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Field(() => Date, {nullable: true})
  @Column()
  deadline?: Date

  @Column()
  @Field(() => String)
  content!: string
}

@InputType()
export class UpdateEvent extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Field(() => String)
  @Column()
  content!: string

  @Field(() => Date, {nullable: true})
  @Column()
  deadline?: Date
}

@InputType()
export class EventsSort {
  @Field(() => String, {nullable: true})
  nearestEvent?: Sort

  @Field(() => String, {nullable: true})
  pin?: Sort
}

@InputType()
export class EventsFilter {
  @Field(() => Int, {nullable: true})
  expired?: EventFilter
}

@InputType()
export class RemoveEvents {
  @Field(() => [ID])
  ids!: ObjectId[]
}
