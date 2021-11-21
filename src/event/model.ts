import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ArgsType, Field, ID, ObjectType} from '@nestjs/graphql'
import {ObjectId} from 'mongodb'

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
}

@ArgsType()
export class CreateEvent extends BaseEntity {
  @Column()
  @Field(() => ID)
  boardId!: ObjectId

  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Column()
  @Field(() => String)
  content!: string
}

@ArgsType()
export class UpdateEvent extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Column()
  @Field(() => String)
  content!: string
}
