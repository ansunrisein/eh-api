import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {Permission} from '../board-link/model'
import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {Connection} from '../pagination/model'

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
