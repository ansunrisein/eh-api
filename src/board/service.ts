import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {MongoRepository} from 'typeorm'
import {getRepositoryToken} from '@nestjs/typeorm'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {Event} from '../event/model'
import {EventService} from '../event/service'
import {Board, CreateBoard, UpdateBoard} from './model'

@Injectable()
export class BoardService {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(Board)))
    private boardRepository: MongoRepository<Board>,
    private eventService: EventService,
  ) {}

  async board(_id: ObjectId): Promise<Board | undefined> {
    return this.boardRepository.findOne({_id})
  }

  async dashboard(user: User | undefined): Promise<Board[] | undefined> {
    if (!user) {
      return this.boardRepository
        .aggregateEntity([
          {
            $match: {isPrivate: false},
          },
          {
            $lookup: {
              from: 'events',
              localField: '_id',
              foreignField: 'boardId',
              as: 'events',
            },
          },
          {
            $match: {
              'events.0': {$exists: true},
            },
          },
        ])
        .toArray()
    }

    return this.boardRepository.find({userId: user._id})
  }

  async events(boardId: ObjectId): Promise<Event[]> {
    return this.eventService.getEventsByBoardId(boardId)
  }

  async createBoard(user: User, board: CreateBoard): Promise<Board | undefined> {
    return this.boardRepository.save({
      ...board,
      userId: user._id,
    })
  }

  // TODO: replace with soft deleting
  async removeBoard(user: User, _id: ObjectId): Promise<Board | undefined> {
    const board = await this.boardRepository.findOne({_id})
    await this.boardRepository.deleteOne({_id})
    return board
  }

  async updateBoard(user: User, board: UpdateBoard): Promise<Board | undefined> {
    const oldBoard = await this.boardRepository.findOne({
      _id: board._id,
      userId: user._id,
    })
    await this.boardRepository.update({_id: board._id}, board)
    return Board.merge(oldBoard, board)
  }
}
