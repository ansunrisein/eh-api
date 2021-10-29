import {MongoRepository} from 'typeorm'
import {getRepositoryToken} from '@nestjs/typeorm'
import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {CreateEvent, Event, UpdateEvent} from './model'
import {ObjectId} from 'mongodb'

@Injectable()
export class EventService {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(Event)))
    private eventRepository: MongoRepository<Event>,
  ) {}

  async createEvent(event: CreateEvent): Promise<Event | undefined> {
    return this.eventRepository.save(event)
  }

  async getById(_id: ObjectId): Promise<Event | undefined> {
    return this.eventRepository.findOne({_id})
  }

  async removeEvent(_id: ObjectId): Promise<Event | undefined> {
    const event = await this.eventRepository.findOne({_id})
    await this.eventRepository.deleteOne({_id})
    return event
  }

  async updateEvent(event: UpdateEvent): Promise<Event | undefined> {
    const oldEvent = await this.eventRepository.findOne({_id: event._id})
    await this.eventRepository.updateOne({_id: event._id}, {$set: event}, {upsert: true})
    return Event.merge(oldEvent, event)
  }
}
