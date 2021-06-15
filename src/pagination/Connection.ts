import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectID } from 'mongodb';
import { PageInfo } from './PageInfo';

@ObjectType()
export abstract class Connection<T extends { _id: ObjectID }> {
  abstract edges: {
    node: T;
    cursor: string;
  }[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}
