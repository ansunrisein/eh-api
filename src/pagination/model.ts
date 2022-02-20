import {Field, InputType, Int, ObjectType} from '@nestjs/graphql'
import {ObjectID} from 'mongodb'

@ObjectType()
export class PageInfo {
  @Field(() => String, {nullable: true})
  startCursor?: string

  @Field(() => String, {nullable: true})
  endCursor?: string

  @Field(() => Boolean)
  hasNextPage!: boolean

  @Field(() => Boolean)
  hasPreviousPage!: boolean
}

@ObjectType()
export abstract class Connection<T extends {_id: ObjectID}> {
  abstract edges: {
    node: T
    cursor: string
  }[]

  @Field(() => PageInfo)
  pageInfo!: PageInfo
}

@InputType()
export class Page {
  @Field(() => String, {nullable: true})
  after?: string

  @Field(() => Int)
  first!: number
}
