import { BaseEntity, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ArgsType, Field, ID, ObjectType } from '@nestjs/graphql';
import { Connection } from '../pagination/Connection';
import { User } from '../user/model';
import { ObjectID } from 'mongodb';
import { EventConnection } from '../event/model';

@ObjectType()
@Entity({ name: 'boards' })
export class Board extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectID;

  @Field(() => User)
  user!: User;

  @Column()
  userId!: ObjectID;

  @Field(() => String)
  @Column()
  title!: string;

  @Field(() => String, { nullable: true })
  @Column()
  description?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  private!: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  favorite!: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  pinned!: boolean;

  @Field(() => EventConnection)
  @Column()
  events!: EventConnection;
}

@ObjectType()
export class BoardEdge {
  @Field(() => ID)
  cursor!: string;

  @Field(() => Board)
  node!: Board;
}

@ObjectType()
export class BoardConnection extends Connection<Board> {
  @Field(() => [BoardEdge])
  edges!: BoardEdge[];
}

@ArgsType()
export class CreateBoard {
  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean)
  private!: boolean;
}

@ArgsType()
export class UpdateBoard extends CreateBoard {
  @Field(() => ID)
  _id!: ObjectID;

  @Field(() => Boolean)
  favorite!: boolean;

  @Field(() => Boolean)
  pinned!: boolean;
}
