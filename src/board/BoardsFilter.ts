import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BoardsFilter {
  @Field(() => Int, { nullable: true })
  ownership?: number;

  @Field(() => Int, { nullable: true })
  favorite?: number;

  @Field(() => Int, { nullable: true })
  pin?: number;
}
