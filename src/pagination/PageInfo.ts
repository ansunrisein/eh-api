import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field(() => ID, { nullable: true })
  startCursor?: string;

  @Field(() => ID, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean)
  hasNextPage!: boolean;

  @Field(() => Boolean)
  hasPreviousPage!: boolean;
}
