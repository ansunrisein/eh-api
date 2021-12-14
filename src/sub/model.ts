import {Field, ID, InputType, ObjectType} from '@nestjs/graphql'
import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'

@ObjectType()
@Entity({name: 'subs'})
export class Sub extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  boardId!: ObjectId

  @Column()
  userId!: ObjectId
}

@InputType()
export class CreateSub {
  @Field(() => ID)
  boardId!: ObjectId
}
