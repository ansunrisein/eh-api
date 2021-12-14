import {Args, ID, Mutation, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {ParseObjectID} from '../shared/pipes'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {Event} from '../event/model'
import {UserService} from '../user/service'
import {BoardLink, Permission} from '../board-link/model'
import {BoardLinkService} from '../board-link/service'
import {BoardLinkGuard} from '../board-link/guards'
import {BoardLinkPermission} from '../board-link/permissions'
import {BoardGuard} from './guards'
import {BoardPermission} from './permissions'
import {BoardService} from './service'
import {Board, CreateBoard, UpdateBoard} from './model'
import {Sub} from '../sub/model'
import {SubService} from '../sub/service'
import {InjectLinkToken} from '../auth/@InjectLinkToken'

@Resolver(() => Board)
export class BoardResolver {
  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => UserService))
  private userService!: UserService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => SubService))
  private subService!: SubService

  @ResolveField('events', () => [Event])
  events(@Parent() board: Board) {
    return this.boardService.events(board._id)
  }

  @ResolveField('user', () => User)
  user(@Parent() board: Board) {
    return this.userService.getUserById(board.userId)
  }

  @ResolveField('sub', () => Sub)
  sub(@InjectUser() user: User | undefined, @Parent() board: Board) {
    return this.subService.getSubByBoardAndUser({userId: user?._id, boardId: board._id})
  }

  @ResolveField('boardLinks', () => [BoardLink])
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.VIEW_BOARD_LINK))
  boardLinks(@Parent() board: Board) {
    return this.boardLinkService.getBoardLinksByBoardId(board._id)
  }

  @ResolveField('permissions', () => [Permission])
  permissions(
    @InjectUser() user: User | undefined,
    @InjectLinkToken() linkToken: string | undefined,
    @Parent() board: Board,
  ) {
    return this.boardService.getBoardPermissions(board, user, linkToken)
  }

  @Query(() => Board)
  @UseGuards(BoardGuard.for(BoardPermission.VIEW_BOARD))
  board(
    @Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId,
  ): Promise<Board | undefined> {
    return this.boardService.board(boardId)
  }

  @Query(() => [Board])
  async dashboard(@InjectUser() user: User | undefined): Promise<Board[] | undefined> {
    return await this.boardService.dashboard(user)
  }

  @Mutation(() => Board)
  @UseGuards(BoardGuard.for(BoardPermission.CREATE_BOARD))
  createBoard(
    @InjectUser() user: User,
    @Args('board') board: CreateBoard,
  ): Promise<Board | undefined> {
    return this.boardService.createBoard(user, board)
  }

  @Mutation(() => Board)
  @UseGuards(BoardGuard.for(BoardPermission.REMOVE_BOARD))
  removeBoard(
    @Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId,
  ): Promise<Board | undefined> {
    return this.boardService.removeBoard(boardId)
  }

  @Mutation(() => Board)
  @UseGuards(
    BoardGuard.for(BoardPermission.UPDATE_BOARD_DESCRIPTION),
    BoardGuard.for(BoardPermission.UPDATE_BOARD_VISIBILITY),
  )
  updateBoard(
    @Args('board', {type: () => UpdateBoard}, ParseObjectID.for(['_id'])) board: UpdateBoard,
  ): Promise<Board | undefined> {
    return this.boardService.updateBoard(board)
  }
}
