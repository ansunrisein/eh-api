import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {ArgsType, Field, ID, ObjectType, registerEnumType} from '@nestjs/graphql'
import {Board} from '../board/model'
import {BoardPermission} from '../board/permissions'
import {BoardLinkPermission} from './permissions'
import {EventPermission} from '../event/permissions'

export type Permission = BoardLinkPermission | BoardPermission | EventPermission
export const Permission = {...BoardLinkPermission, ...BoardPermission, ...EventPermission}

registerEnumType(Permission, {name: 'Permission'})

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
  board: Board
}

@ArgsType()
export class CreateBoardLink {
  @Field(() => ID)
  boardId!: ObjectId

  @Field(() => [Permission])
  permissions!: Permission[]
}

@ArgsType()
export class UpdateBoardLink {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => [Permission])
  permissions!: Permission[]
}
