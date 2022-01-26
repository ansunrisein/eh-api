import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {ObjectID, ObjectId} from 'mongodb'
import {Connection} from '../pagination/model'

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
}

@ObjectType()
export class EventEdge {
  @Field(() => ID)
  cursor!: ObjectID

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
