import {BaseEntity, Column, Entity, ObjectIdColumn, Unique} from 'typeorm'
import {Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {EventConnection} from '../event/model'
import {BoardLinkConnection, Permission} from '../board-link/model'
import {Sub} from '../sub/model'
import {Connection} from '../pagination/model'
import {BoardFilter} from './board-filter'
import {Sort} from '../shared/sort'
import {BoardTag} from '../board-tag/model'
import {BoardParticipantConnection} from '../board-participant/model'

export type BoardCursor = {
  _id: string
  favorite?: boolean
  pin?: boolean
  nearestEvent?: Date
  views?: number
}

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

  @Column()
  tagsIds?: ObjectId[]

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

  @Field(() => Boolean)
  isFavorite!: boolean

  @Field(() => Boolean)
  isPin!: boolean

  @Field(() => [BoardTag], {nullable: true})
  tags?: BoardTag[]

  @Field(() => Int)
  views?: number

  @Field(() => BoardParticipantConnection)
  participants?: BoardParticipantConnection

  @Field(() => Boolean)
  participationSuggestion!: boolean

  _cursor?: BoardCursor
}

@InputType()
export class CreateBoard {
  @Field(() => String)
  title!: string

  @Field(() => String, {nullable: true})
  description?: string

  @Field(() => Boolean)
  isPrivate!: boolean

  @Field(() => [ID], {nullable: true})
  tagsIds?: ObjectId[]
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
export class UpdateBoardTags {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => [ID], {nullable: true})
  tagsIds?: ObjectId[]
}

@InputType()
export class BoardId {
  @Field(() => ID)
  _id!: ObjectId
}

@ObjectType()
export class BoardEdge {
  @Field(() => String)
  cursor!: string

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

@ObjectType()
@Entity({name: 'pin-boards'})
@Unique('primary', ['userId', 'boardId'])
export class PinBoard extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  userId!: ObjectId

  @Column()
  boardId!: ObjectId
}

@InputType()
export class BoardsSort {
  @Field(() => String, {nullable: true})
  nearestEvent?: Sort

  @Field(() => String, {nullable: true})
  favorite?: Sort

  @Field(() => String, {nullable: true})
  pin?: Sort

  @Field(() => String, {nullable: true})
  views?: Sort
}

@InputType()
export class BoardsFilter {
  @Field(() => Int, {nullable: true})
  ownership?: BoardFilter

  @Field(() => Int, {nullable: true})
  favorite?: BoardFilter

  @Field(() => Int, {nullable: true})
  pin?: BoardFilter
}

@InputType()
export class BoardsSearch {
  @Field(() => String, {nullable: true})
  text?: string
}
