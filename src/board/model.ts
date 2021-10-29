import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ArgsType, Field, ID, ObjectType} from '@nestjs/graphql'
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

  @Field(() => [Event])
  @Column()
  events!: Event[]
}

@ArgsType()
export class CreateBoard {
  @Field(() => String)
  title!: string
}

@ArgsType()
export class UpdateBoard extends CreateBoard {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => String)
  title!: string
}
