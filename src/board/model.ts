import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {EventConnection} from '../event/model'
import {BoardLinkConnection, Permission} from '../board-link/model'
import {Sub} from '../sub/model'
import {Connection} from '../pagination/model'

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

  @Field(() => String, {nullable: true})
  @Column()
  description?: string

  @Field(() => Boolean)
  @Column()
  isPrivate!: boolean

  @Field(() => EventConnection)
  events?: EventConnection

  @Field(() => Sub, {nullable: true})
  sub?: Sub

  @Field(() => BoardLinkConnection)
  boardLinks?: BoardLinkConnection

  @Field(() => [Permission])
  permissions?: Permission[]

  @Field(() => Number)
  eventsCount!: number
}

@InputType()
export class CreateBoard {
  @Field(() => String)
  title!: string

  @Field(() => String, {nullable: true})
  description?: string

  @Field(() => Boolean)
  isPrivate!: boolean
}

@InputType()
export class UpdateBoardDescription {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => String)
  title!: string

  @Field(() => String, {nullable: true})
  description?: string
}

@InputType()
export class UpdateBoardVisibility {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => Boolean)
  isPrivate!: boolean
}

@InputType()
export class BoardId {
  @Field(() => ID)
  _id!: ObjectId
}

@ObjectType()
export class BoardEdge {
  @Field(() => ID)
  cursor!: ObjectId

  @Field(() => Board)
  node!: Board
}

@ObjectType()
export class BoardConnection extends Connection<Board> {
  @Field(() => [BoardEdge])
  edges!: BoardEdge[]
}

@ObjectType()
@Entity({name: 'favorite-boards'})
@Unique('primary', ['userId', 'boardId'])
export class FavoriteBoard extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  userId!: ObjectId

  @Column()
  boardId!: ObjectId
}
