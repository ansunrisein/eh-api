import {Args, ID, Mutation, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards, UseInterceptors} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {ParseObjectID} from '../shared/pipes'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {EventConnection, EventsSort} from '../event/model'
import {UserService} from '../user/service'
import {BoardLinkConnection, Permission} from '../board-link/model'
import {BoardLinkService} from '../board-link/service'
import {BoardLinkGuard} from '../board-link/guards'
import {BoardLinkPermission} from '../board-link/permissions'
import {BoardGuard} from './guards'
import {BoardPermission} from './permissions'
import {BoardService} from './service'
import {
  Board,
  BoardConnection,
  BoardId,
  BoardsFilter,
  BoardsSort,
  CreateBoard,
  UpdateBoardDescription,
  UpdateBoardVisibility,
} from './model'
import {Sub} from '../sub/model'
import {SubService} from '../sub/service'
import {ConnectionInterceptor} from '../pagination/interceptors'
import {Page} from '../pagination/model'
import {EventService} from '../event/service'
import {InjectLinkToken} from '../auth/@InjectLinkToken'
import {AuthGuard} from '../auth/AuthGuard'

@Resolver(() => Board)
export class BoardResolver {
  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => UserService))
  private userService!: UserService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => EventService))
  private eventService!: EventService

  @Inject(forwardRef(() => SubService))
  private subService!: SubService

  @ResolveField('events', () => EventConnection)
  @UseInterceptors(ConnectionInterceptor)
  events(
    @Parent() board: Board,
    @Args('page') page: Page,
    @Args('sort', {nullable: true}) sort?: EventsSort,
    @Args('filter', {nullable: true}) filter?: EventsFilter,
  ) {
    return this.eventService.getEventsByBoardId(board._id, page, sort, filter)
  }

  @ResolveField('eventsCount', () => Number)
  eventsCount(@Parent() board: Board) {
    return this.eventService.countEventsByBoardId(board._id)
  }

  @ResolveField('isFavorite', () => Boolean)
  isFavorite(@InjectUser() user: User | undefined, @Parent() board: Board) {
    return this.boardService.isFavoriteBoard(board, user)
  }

  @ResolveField('isPin', () => Boolean)
  isPin(@InjectUser() user: User | undefined, @Parent() board: Board) {
    return this.boardService.isPinBoard(board, user)
  }

  @ResolveField('user', () => User)
  user(@Parent() board: Board) {
    return this.userService.getUserById(board.userId)
  }

  @ResolveField('sub', () => Sub)
  sub(@InjectUser() user: User | undefined, @Parent() board: Board) {
    return this.subService.getSubByBoardAndUser({userId: user?._id, boardId: board._id})
  }

  @ResolveField('boardLinks', () => BoardLinkConnection)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.VIEW_BOARD_LINK))
  @UseInterceptors(ConnectionInterceptor)
  boardLinks(@Parent() board: Board, @Args('page') page: Page) {
    return this.boardLinkService.getBoardLinksByBoardId(board._id, page)
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

  @Query(() => BoardConnection)
  @UseInterceptors(ConnectionInterceptor)
  dashboard(
    @InjectUser() user: User | undefined,
    @Args('page') page: Page,
    @Args('sort', {nullable: true}) sort?: BoardsSort,
    @Args('filter', {nullable: true}) filter?: BoardsFilter,
  ): Promise<Board[] | undefined> {
    return this.boardService.dashboard(user, page, sort, filter)
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
  @UseGuards(BoardGuard.for(BoardPermission.UPDATE_BOARD_VISIBILITY))
  updateBoardVisibility(
    @Args('board', {type: () => UpdateBoardVisibility}, ParseObjectID.for(['_id']))
    board: UpdateBoardVisibility,
  ): Promise<Board | undefined> {
    return this.boardService.updateBoard(board)
  }

  @Mutation(() => Board)
  @UseGuards(BoardGuard.for(BoardPermission.UPDATE_BOARD_DESCRIPTION))
  updateBoardDescription(
    @Args('board', {type: () => UpdateBoardDescription}, ParseObjectID.for(['_id']))
    board: UpdateBoardDescription,
  ): Promise<Board | undefined> {
    return this.boardService.updateBoard(board)
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard, BoardGuard.for(BoardPermission.VIEW_BOARD))
  markBoardAsFavorite(
    @InjectUser() user: User,
    @Args('board', {type: () => BoardId}, ParseObjectID.for(['_id'])) board: BoardId,
  ): Promise<Board | undefined> {
    return this.boardService.setBoardFavorite(user._id, board._id)
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard, BoardGuard.for(BoardPermission.VIEW_BOARD))
  unmarkBoardAsFavorite(
    @InjectUser() user: User,
    @Args('board', {type: () => BoardId}, ParseObjectID.for(['_id'])) board: BoardId,
  ): Promise<Board | undefined> {
    return this.boardService.unsetBoardFavorite(user._id, board._id)
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard, BoardGuard.for(BoardPermission.VIEW_BOARD))
  markBoardAsPin(
    @InjectUser() user: User,
    @Args('board', {type: () => BoardId}, ParseObjectID.for(['_id'])) board: BoardId,
  ): Promise<Board | undefined> {
    return this.boardService.setBoardPin(user._id, board._id)
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard, BoardGuard.for(BoardPermission.VIEW_BOARD))
  unmarkBoardAsPin(
    @InjectUser() user: User,
    @Args('board', {type: () => BoardId}, ParseObjectID.for(['_id'])) board: BoardId,
  ): Promise<Board | undefined> {
    return this.boardService.unsetBoardPin(user._id, board._id)
  }
}
