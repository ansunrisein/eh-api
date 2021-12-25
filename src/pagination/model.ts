import {Field, ObjectType, ID, InputType, Int} from '@nestjs/graphql'
import {ObjectID} from 'mongodb'

@ObjectType()
export class PageInfo {
  @Field(() => ID, {nullable: true})
  startCursor?: ObjectID

  @Field(() => ID, {nullable: true})
  endCursor?: ObjectID

  @Field(() => Boolean)
  hasNextPage!: boolean

  @Field(() => Boolean)
  hasPreviousPage!: boolean
}

@ObjectType()
export abstract class Connection<T extends {_id: ObjectID}> {
  abstract edges: {
    node: T
    cursor: ObjectID
  }[]

  @Field(() => PageInfo)
  pageInfo!: PageInfo
}

@InputType()
export class Page {
  @Field(() => ID, {nullable: true})
  after?: ObjectID

  @Field(() => Int)
  first!: number
}
