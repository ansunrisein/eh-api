import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class Page {
  // @Field(() => ID, { nullable: true })
  // before?: string;

  @Field(() => ID, { nullable: true })
  after?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  // @Field(() => Int, { nullable: true })
  // last?: number;
}
