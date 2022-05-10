import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {getRepositoryToken} from '@nestjs/typeorm'
import {ObjectId} from 'mongodb'
import {MongoRepository} from 'typeorm'
import {Board} from '../board/model'
import {BoardView} from './model'

@Injectable()
export class BoardViewService {
  @Inject(forwardRef(() => getRepositoryToken(BoardView)))
  private boardViewRepository!: MongoRepository<BoardView>

  async trackBoardView(board: Board, userId: ObjectId): Promise<boolean> {
    if (board.userId.equals(userId)) {
      return false
    }

    const view = await this.boardViewRepository.findOne({boardId: board._id, userId})

    if (!view) {
      await this.boardViewRepository.save({boardId: board._id, userId, count: 1})

      return true
    }

    if (BoardViewService.canTrackView(view)) {
      await this.boardViewRepository.updateOne(
        {boardId: board._id, userId},
        {count: view.count + 1},
      )

      return true
    }

    return false
  }

  async countViewsByBoardId(boardId: ObjectId): Promise<number> {
    const result = await this.boardViewRepository
      .aggregate<{count: number}>([
        {
          $match: {
            boardId,
          },
        },
        {
          $group: {
            _id: '$boardId',
            count: {
              $sum: '$count',
            },
          },
        },
      ])
      .toArray()

    return result[0]?.count || 0
  }

  private static canTrackView(view: BoardView): boolean {
    return Number(view.updatedAt) < Date.now() - 2 * 3600 * 1000
  }
}
