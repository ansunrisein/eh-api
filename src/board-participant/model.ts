import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {Permission} from '../board-link/model'
import {Field, ID, ObjectType} from '@nestjs/graphql'

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
