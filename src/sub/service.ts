import {ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {getRepositoryToken} from '@nestjs/typeorm'
import {MongoRepository} from 'typeorm'
import {ObjectId} from 'mongodb'
import {Sub} from './model'
import {Board} from '../board/model'
import {BoardService} from '../board/service'

@Injectable()
export class SubService {
  @Inject(forwardRef(() => getRepositoryToken(Sub)))
  private subRepository!: MongoRepository<Sub>

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  static extractSubId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)

    const id = args.sub?._id || args.subId

    if (id) {
      return id && new ObjectId(id)
    }

    const root = context.getArgByIndex(0)

    if (root instanceof Sub) {
      return root._id
    }
  }

  async getSubById(_id: ObjectId): Promise<Sub | undefined> {
    return this.subRepository.findOne({_id})
  }

  async getSubByBoardAndUser({
    boardId,
    userId,
  }: Partial<Pick<Sub, 'userId' | 'boardId'>>): Promise<Sub | undefined> {
    if (!userId || !boardId) {
      return
    }

    return this.subRepository.findOne({userId, boardId})
  }

  async getSubsByBoardId(boardId: ObjectId): Promise<Sub[] | undefined> {
    return this.subRepository.find({boardId})
  }

  async getSubsByUserId(userId: ObjectId): Promise<Sub[] | undefined> {
    return this.subRepository.find({userId})
  }

  async createSub(userId: ObjectId, boardId: ObjectId): Promise<Board | undefined> {
    await this.subRepository.save({boardId, userId})
    return this.boardService.board(boardId)
  }

  async removeSub(userId: ObjectId, boardId: ObjectId): Promise<Board | undefined> {
    await this.subRepository.deleteOne({userId, boardId})
    return this.boardService.board(boardId)
  }
}
