import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {Field, ID, InputType, ObjectType, registerEnumType} from '@nestjs/graphql'
import {Board} from '../board/model'
import {BoardPermission} from '../board/permissions'
import {BoardLinkPermission} from './permissions'
import {EventPermission} from '../event/permissions'

// TODO: fix types
export const permissions = {
  Board: BoardPermission,
  Event: EventPermission,
  BoardLink: BoardLinkPermission,
}
export type Permission = BoardLinkPermission | BoardPermission | EventPermission
export const Permission = {...BoardLinkPermission, ...BoardPermission, ...EventPermission}

registerEnumType(Permission, {name: 'Permission'})

@ObjectType()
export class PermissionDescriptor {
  @Field(() => String)
  name!: string

  @Field(() => Permission)
  value!: Permission
}

@ObjectType()
export class EntityPermissions {
  @Field(() => String)
  name!: string

  @Field(() => [PermissionDescriptor])
  permissions!: PermissionDescriptor[]
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

  @Field(() => [Permission])
  @Column()
  permissions!: Permission[]

  @Column()
  boardId!: ObjectId

  @Field(() => Board)
  board?: Board
}

@InputType()
export class CreateBoardLink {
  @Field(() => ID)
  boardId!: ObjectId

  @Field(() => [Permission])
  permissions!: Permission[]
}

@InputType()
export class UpdateBoardLink {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => [Permission])
  permissions!: Permission[]
}
