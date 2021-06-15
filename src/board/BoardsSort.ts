import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BoardsSort {
  @Field(() => String, { nullable: true })
  nearestEvent?: string;

  @Field(() => String, { nullable: true })
  favorite?: string;

  @Field(() => String, { nullable: true })
  subsCount?: string;

  @Field(() => String, { nullable: true })
  pin?: string;
}
