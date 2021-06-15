import { BaseEntity, Column, Entity, ObjectIdColumn } from 'typeorm';
import {
  ArgsType,
  Field,
  ID,
  InterfaceType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ObjectID } from 'mongodb';
import { Connection } from '../pagination/Connection';
import { Board } from '../board/model';

export enum EventType {
  TEXT,
  LIST,
  PICTURE,
}

registerEnumType(EventType, { name: 'EventType' });

@InterfaceType({
  resolveType: (event) =>
    event.type === EventType.TEXT ? TextEvent : ListEvent,
})
@Entity()
export class Event extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  boardId!: ObjectID;

  @Field(() => Board)
  board!: Board;

  @Field(() => EventType)
  @Column()
  type!: EventType;

  @Field(() => String, { nullable: true })
  @Column()
  header?: string;

  @Field(() => Date, { nullable: true })
  @Column()
  deadline?: Date;

  @Field(() => Boolean)
  @Column({ default: false })
  pinned!: boolean;

  @Column()
  text?: string;

  @Column()
  list?: string[];
}

@ObjectType({ implements: [Event] })
@Entity({ name: 'event' })
export class TextEvent extends Event {
  @Field(() => EventType)
  type: EventType.TEXT;

  @Field(() => String)
  text!: string;
}

@ObjectType({ implements: [Event] })
@Entity({ name: 'event' })
export class ListEvent extends Event {
  @Field(() => EventType)
  type: EventType.LIST;

  @Field(() => [String])
  list!: string[];
}

@ObjectType()
export class EventEdge {
  @Field(() => ID)
  cursor!: string;

  @Field(() => Event)
  node!: Event;
}

@ObjectType()
export class EventConnection extends Connection<Event> {
  @Field(() => [EventEdge])
  edges!: EventEdge[];
}

@ArgsType()
export class CreateEvent {
  @Field(() => ID)
  boardId!: ObjectID;

  @Field(() => EventType)
  type!: EventType;

  @Field(() => Boolean)
  pinned!: boolean;

  @Field(() => String, { nullable: true })
  header?: string;

  @Field(() => Date, { nullable: true })
  deadline?: Date;

  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => [String], { nullable: true })
  list?: string[];
}

@ArgsType()
export class UpdateEvent {
  @Field(() => ID)
  _id!: ObjectID;

  @Field(() => EventType)
  type!: EventType;

  @Field(() => String, { nullable: true })
  header?: string;

  @Field(() => Date, { nullable: true })
  deadline?: Date;

  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => [String], { nullable: true })
  list?: string[];
}
