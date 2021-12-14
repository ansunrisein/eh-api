import {ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {MongoRepository} from 'typeorm'
import {getRepositoryToken} from '@nestjs/typeorm'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {Event} from '../event/model'
import {EventService} from '../event/service'
import {Board, CreateBoard, UpdateBoard} from './model'
import {Permission, permissions} from '../board-link/model'
import {BoardLinkService} from '../board-link/service'
import {BoardPermission} from './permissions'

@Injectable()
export class BoardService {
  @Inject(forwardRef(() => getRepositoryToken(Board)))
  private boardRepository!: MongoRepository<Board>

  @Inject(forwardRef(() => EventService))
  private eventService!: EventService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  static extractBoardId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)

    const id = args.board?._id || args.boardId || args.event?.boardId || args.boardLink?.boardId

    if (id) {
      return id && new ObjectId(id)
    }

    const root = context.getArgByIndex(0)

    if (root instanceof Board) {
      return root._id
    }
  }

  async board(_id: ObjectId): Promise<Board | undefined> {
    return this.boardRepository.findOne({_id})
  }

  async getBoardPermissions(board: Board, user?: User, linkToken?: string): Promise<Permission[]> {
    const allPermissions = Object.values(permissions).flatMap(entity => Object.values(entity))

    if (user && board.userId.equals(user._id)) {
      return allPermissions
    }

    if (!linkToken) {
      return board.isPrivate ? [] : [BoardPermission.VIEW_BOARD]
    }

    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return board.isPrivate ? [] : [BoardPermission.VIEW_BOARD]
    }

    return user
      ? link.permissions
      : link.permissions.filter(perm =>
          [Permission.VIEW_BOARD, Permission.VIEW_EVENT, Permission.VIEW_BOARD_LINK].includes(perm),
        )
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

  async updateBoard(board: UpdateBoard): Promise<Board | undefined> {
    const oldBoard = await this.boardRepository.findOne({_id: board._id})

    if (!oldBoard) {
      return undefined
    }

    await this.boardRepository.update({_id: board._id}, board)

    return Board.merge(oldBoard, board)
  }

  // TODO: replace with soft deleting
  async removeBoard(_id: ObjectId): Promise<Board | undefined> {
    const board = await this.boardRepository.findOne({_id})
    await this.boardRepository.deleteOne({_id})
    return board
  }
}
