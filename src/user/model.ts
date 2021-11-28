import {BaseEntity, Column, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'
import {Field, ID, ObjectType} from '@nestjs/graphql'

@ObjectType()
@Entity({name: 'users'})
export class User extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  providerId!: string

  @Field(() => String)
  @Column({unique: true})
  nickname!: string

  @Field(() => String, {nullable: true})
  @Column()
  name?: string

  @Field(() => String, {nullable: true})
  @Column()
  avatar?: string
}
