import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {UserService} from '../user/service'
import {BoardService} from './service'

@Injectable()
export class CanUpdateBoard implements CanActivate {
  constructor(private userService: UserService, private boardService: BoardService) {}

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

  protected static extractUserId(context: ExecutionContext): ObjectId | undefined {
    return context.getArgByIndex(2).user?._id
  }

  private static extractBoardId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardId || args.board?._id || args._id
    return id && new ObjectId(id)
  }
}
