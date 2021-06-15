import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Page } from '../pagination/Page';
import { CreateEvent, Event, UpdateEvent } from './model';

@Injectable()
export class EventService {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(Event)))
    private eventRepository: MongoRepository<Event>,
  ) {}

  async createEvent(event: CreateEvent): Promise<Event | undefined> {
    return this.eventRepository.save(event);
  }

  // TODO: replace with soft deleting
  async removeEvent(_id: ObjectID): Promise<Event | undefined> {
    const event = await this.eventRepository.findOne({ _id });
    await this.eventRepository.deleteOne({ _id });
    return event;
  }

  async updateEvent(event: UpdateEvent): Promise<Event | undefined> {
    const oldEvent = await this.eventRepository.findOne({ _id: event._id });
    await this.eventRepository.updateOne(
      { _id: event._id },
      { $set: event },
      { upsert: true },
    );
    return Event.merge(oldEvent, event);
  }

  async getEventsByBoardId(
    boardId: ObjectID,
    { first = 25, after = '000000000000' }: Page,
  ): Promise<Event[]> {
    return this.eventRepository
      .aggregateEntity([
        {
          $match: {
            boardId,
          },
        },
        {
          $match: {
            _id: {
              $gt: new ObjectID(after),
            },
          },
        },
        {
          $limit: first,
        },
      ])
      .toArray();
  }

  async getById(_id: ObjectID): Promise<Event | undefined> {
    return this.eventRepository.findOne({ _id });
  }
}
