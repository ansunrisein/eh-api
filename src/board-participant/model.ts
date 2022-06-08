import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {Permission} from '../board-link/model'
import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {Connection} from '../pagination/model'
import {Board} from '../board/model'

@ObjectType()
@Entity({name: 'board-participants'})
export class BoardParticipant extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  userId!: ObjectId

  @Column()
  boardId!: ObjectId

  @Column({nullable: true})
  linkId?: ObjectId

  @Field(() => [Permission])
  @Column({nullable: true})
  permissions?: Permission[]

  @Field(() => User)
  user!: User

  @Field(() => Board)
  board!: Board
}

@ObjectType()
@Entity({name: 'board-participation-declines'})
export class BoardParticipationDecline extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  userId!: ObjectId

  @Column()
  linkId!: ObjectId
}

@ObjectType()
export class BoardParticipantEdge {
  @Field(() => String)
  cursor!: string

  @Field(() => BoardParticipant)
  node!: BoardParticipant
}

@ObjectType()
export class BoardParticipantConnection extends Connection<BoardParticipant> {
  @Field(() => [BoardParticipantEdge])
  edges!: BoardParticipantEdge[]
}

@InputType()
export class RemoveBoardParticipants {
  @Field(() => ID)
  _id!: ObjectId

  @Field(() => [ID])
  participantsId!: ObjectId[]
}
