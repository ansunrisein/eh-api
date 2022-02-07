import {ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {MongoRepository} from 'typeorm'
import {getRepositoryToken} from '@nestjs/typeorm'
import {ObjectId} from 'mongodb'
import {User} from '../user/model'
import {
  Board,
  BoardsFilter,
  BoardsSort,
  CreateBoard,
  FavoriteBoard,
  PinBoard,
  UpdateBoardDescription,
  UpdateBoardVisibility,
} from './model'
import {Permission, permissions} from '../board-link/model'
import {BoardLinkService} from '../board-link/service'
import {BoardPermission} from './permissions'
import {Page} from '../pagination/model'
import {
  makeSortByIsFavoritePipeline,
  makeSortByIsPinPipeline,
  makeSortByNearestEventPipeline,
} from './board-sorts'
import {makeFilterByIsFavoritePipeline, makeFilterByIsPinPipeline} from './board-filter'

@Injectable()
export class BoardService {
  @Inject(forwardRef(() => getRepositoryToken(Board)))
  private boardRepository!: MongoRepository<Board>

  @Inject(forwardRef(() => getRepositoryToken(FavoriteBoard)))
  private favoriteBoardRepository!: MongoRepository<FavoriteBoard>

  @Inject(forwardRef(() => getRepositoryToken(PinBoard)))
  private pinBoardRepository!: MongoRepository<PinBoard>

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  static extractBoardId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)

    const id =
      args.board?._id ||
      args.boardId ||
      args.event?.boardId ||
      args.boardLink?.boardId ||
      args.sub?.boardId

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

  async isFavoriteBoard(board: Board, user?: User): Promise<boolean | undefined> {
    if (!user) {
      return false
    }

    const fav = await this.favoriteBoardRepository.findOne({
      boardId: board._id,
      userId: user._id,
    })

    return !!fav
  }

  async isPinBoard(board: Board, user?: User): Promise<boolean | undefined> {
    if (!user) {
      return false
    }

    const pin = await this.pinBoardRepository.findOne({
      boardId: board._id,
      userId: user._id,
    })

    return !!pin
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

  async dashboard(
    user: User | undefined,
    {first, after = new ObjectId('000000000000')}: Page,
    sort?: BoardsSort,
    filter?: BoardsFilter,
  ): Promise<Board[] | undefined> {
    const pipeline = [
      ...(user
        ? [
            {
              $match: {
                userId: user._id,
              },
            },
            ...makeSortByIsFavoritePipeline({userId: user?._id, sort: sort?.favorite}),
            ...makeSortByIsPinPipeline({userId: user?._id, sort: sort?.pin}),
            ...makeSortByNearestEventPipeline({sort: sort?.nearestEvent}),
            ...makeFilterByIsFavoritePipeline({userId: user?._id, filter: filter?.favorite}),
            ...makeFilterByIsPinPipeline({userId: user?._id, filter: filter?.pin}),
          ]
        : [
            {
              $match: {
                isPrivate: false,
              },
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
          ]),
      {
        $match: {_id: {$gt: after}},
      },
      {
        $limit: first,
      },
    ]

    return this.boardRepository.aggregateEntity(pipeline).toArray()
  }

  async createBoard(user: User, board: CreateBoard): Promise<Board | undefined> {
    return this.boardRepository.save({
      ...board,
      userId: user._id,
    })
  }

  async updateBoard(
    board: UpdateBoardVisibility | UpdateBoardDescription,
  ): Promise<Board | undefined> {
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

  async setBoardFavorite(userId: ObjectId, boardId: ObjectId): Promise<Board | undefined> {
    await this.favoriteBoardRepository.save({
      userId,
      boardId,
    })
    return this.board(boardId)
  }

  async unsetBoardFavorite(userId: ObjectId, boardId: ObjectId): Promise<Board | undefined> {
    await this.favoriteBoardRepository.deleteOne({userId, boardId})
    return this.board(boardId)
  }

  async setBoardPin(userId: ObjectId, boardId: ObjectId): Promise<Board | undefined> {
    await this.pinBoardRepository.save({
      userId,
      boardId,
    })
    return this.board(boardId)
  }

  async unsetBoardPin(userId: ObjectId, boardId: ObjectId): Promise<Board | undefined> {
    await this.pinBoardRepository.deleteOne({userId, boardId})
    return this.board(boardId)
  }
}
