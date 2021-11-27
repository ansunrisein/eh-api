import {MongoRepository} from 'typeorm'
import {getRepositoryToken} from '@nestjs/typeorm'
import {ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {CreateEvent, Event, UpdateEvent} from './model'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'

@Injectable()
export class EventService {
  @Inject(forwardRef(() => getRepositoryToken(Event)))
  private eventRepository: MongoRepository<Event>

  static extractEventId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.eventId || args.event?._id || args._id
    return id && new ObjectId(id)
  }

  async getById(_id: ObjectId): Promise<Event | undefined> {
    return this.eventRepository.findOne({_id})
  }

  async getEventsByBoardId(boardId: ObjectId): Promise<Event[]> {
    return this.eventRepository.find({boardId})
  }

  async createEvent(user: User, event: CreateEvent): Promise<Event | undefined> {
    return this.eventRepository.save({...event, userId: user._id})
  }

  async updateEvent(event: UpdateEvent): Promise<Event | undefined> {
    const oldEvent = await this.eventRepository.findOne({_id: event._id})
    await this.eventRepository.updateOne({_id: event._id}, {$set: event}, {upsert: true})
    return Event.merge(oldEvent, event)
  }

  async removeEvent(_id: ObjectId): Promise<Event | undefined> {
    const event = await this.eventRepository.findOne({_id})
    await this.eventRepository.deleteOne({_id})
    return event
  }
}
