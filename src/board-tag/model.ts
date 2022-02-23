import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'

@ObjectType()
@Entity({name: 'board-tags'})
export class BoardTag extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Field(() => String)
  @Column()
  name!: string
}

@InputType()
export class CreateBoardTag {
  @Field(() => String)
  name!: string
}

@InputType()
export class BoardTagId {
  @Field(() => ID)
  _id!: ObjectId
}
