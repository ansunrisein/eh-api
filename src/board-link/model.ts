import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {Field, ID, InputType, ObjectType, registerEnumType} from '@nestjs/graphql'
import {Board} from '../board/model'
import {BoardPermission} from '../board/permissions'
import {BoardLinkPermission} from './permissions'
import {EventPermission} from '../event/permissions'
import {Connection} from '../pagination/model'

const AvailableBoardPermission: Omit<
  Record<keyof typeof BoardPermission, BoardPermission>,
  'CREATE_BOARD'
> = {
  VIEW_BOARD: BoardPermission.VIEW_BOARD,
  UPDATE_BOARD_DESCRIPTION: BoardPermission.UPDATE_BOARD_DESCRIPTION,
  UPDATE_BOARD_VISIBILITY: BoardPermission.UPDATE_BOARD_VISIBILITY,
  REMOVE_BOARD: BoardPermission.REMOVE_BOARD,
}

// TODO: fix types
export const permissions = {
  Board: AvailableBoardPermission,
  Event: EventPermission,
  BoardLink: BoardLinkPermission,
}
export type Permission =
  | BoardLinkPermission
  | Exclude<BoardPermission, BoardPermission.CREATE_BOARD>
  | EventPermission
export const Permission = {...BoardLinkPermission, ...AvailableBoardPermission, ...EventPermission}
export type EntityName = keyof typeof permissions
export const EntityName = Object.keys(permissions).reduce((acc, key) => ({...acc, [key]: key}), {})

registerEnumType(Permission, {name: 'Permission'})
registerEnumType(EntityName, {name: 'EntityName'})

@ObjectType()
export class EntityPermissions {
  @Field(() => EntityName)
  name!: EntityName

  @Field(() => [Permission])
  permissions!: Permission[]
}

@ObjectType()
@Entity({name: 'board-links'})
export class BoardLink extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Field(() => String)
  @Column()
  link!: string

  @Field(() => String)
  @Column()
  name!: string

  @Field(() => [Permission])
  @Column()
  permissions!: Permission[]

  @Field(() => Boolean)
  @Column()
  allowParticipation!: boolean

  @Column()
  boardId!: ObjectId

  @Field(() => Board)
  board?: Board
}

@ObjectType()
export class BoardLinkEdge {
  @Field(() => String)
  cursor!: string

  @Field(() => BoardLink)
  node!: BoardLink
}

@ObjectType()
export class BoardLinkConnection extends Connection<BoardLink> {
  @Field(() => [BoardLinkEdge])
  edges!: BoardLinkEdge[]
}

@InputType()
export class CreateBoardLink {
  @Field(() => ID)
  boardId!: ObjectId

  @Field(() => String)
  name!: string

  @Field(() => [Permission])
  permissions!: Permission[]

  @Field(() => Boolean)
  allowParticipation!: boolean
}

@InputType()
export class UpdateBoardLink {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => String)
  name!: string

  @Field(() => [Permission])
  permissions!: Permission[]
}
