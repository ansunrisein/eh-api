import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ArgsType, Field, ID, ObjectType} from '@nestjs/graphql'
import {ObjectId} from 'mongodb'

@ObjectType()
@Entity()
export class Event extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Field(() => ID)
  @Column()
  userId!: ObjectId

  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Column()
  content!: string
}

@ArgsType()
export class CreateEvent extends BaseEntity {
  @Field(() => String, {nullable: true})
  @Column()
  title?: string

  @Column()
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
  content!: string
}
