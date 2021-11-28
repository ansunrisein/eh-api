import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {Event} from '../event/model'

@ObjectType()
@Entity({name: 'boards'})
export class Board extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Field(() => User)
  user!: User

  @Column()
  userId!: ObjectId

  @Field(() => String)
  @Column()
  title!: string

  @Field(() => Boolean)
  @Column()
  isPrivate!: boolean

  @Field(() => [Event])
  @Column()
  events!: Event[]
}

@InputType()
export class CreateBoard {
  @Field(() => String)
  title!: string

  @Field(() => Boolean)
  isPrivate!: boolean
}

@InputType()
export class UpdateBoard extends CreateBoard {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => String)
  title!: string

  @Field(() => Boolean)
  isPrivate!: boolean
}
