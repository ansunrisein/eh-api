import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {BoardService} from './service'

export abstract class BoardGuard {
  protected static extractUserId(context: ExecutionContext): ObjectId | undefined {
    return context.getArgByIndex(2).user?._id
  }

  protected static extractBoardId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardId || args.board?._id || args._id
    return id && new ObjectId(id)
  }
}

@Injectable()
export class CanUpdateBoard extends BoardGuard implements CanActivate {
  constructor(private boardService: BoardService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = CanUpdateBoard.extractUserId(context)
    const boardId = CanUpdateBoard.extractBoardId(context)

    return this.canUpdateBoard(userId, boardId)
  }

  public async canUpdateBoard(
    userId: ObjectId | undefined,
    boardId: ObjectId | undefined,
  ): Promise<boolean> {
    if (!boardId) {
      return false
    }

    const board = await this.boardService.board(boardId)

    return board.userId.equals(userId)
  }
}

@Injectable()
export class CanGetBoard extends BoardGuard implements CanActivate {
  constructor(private boardService: BoardService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = CanUpdateBoard.extractUserId(context)
    const boardId = CanUpdateBoard.extractBoardId(context)

    return this.canGetBoard(userId, boardId)
  }

  public async canGetBoard(
    userId: ObjectId | undefined,
    boardId: ObjectId | undefined,
  ): Promise<boolean> {
    if (!boardId) {
      return false
    }

    const board = await this.boardService.board(boardId)

    if (!board.isPrivate) {
      return true
    }

    return board.userId.equals(userId)
  }
}
