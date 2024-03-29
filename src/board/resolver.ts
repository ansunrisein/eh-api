import {Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards, UseInterceptors} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {ParseObjectID} from '../shared/pipes'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {EventConnection, EventsFilter, EventsSort} from '../event/model'
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
  BoardsSearch,
  BoardsSort,
  CreateBoard,
  UpdateBoardDescription,
  UpdateBoardTags,
  UpdateBoardVisibility,
} from './model'
import {Sub} from '../sub/model'
import {SubService} from '../sub/service'
import {ConnectionInterceptor} from '../pagination/interceptors'
import {Page} from '../pagination/model'
import {EventService} from '../event/service'
import {InjectLinkToken} from '../auth/@InjectLinkToken'
import {AuthGuard} from '../auth/AuthGuard'
import {BoardTag} from '../board-tag/model'
import {BoardTagService} from '../board-tag/service'
import {BoardViewService} from '../board-view/service'
import {BoardParticipantService} from '../board-participant/service'
import {BoardParticipantConnection} from '../board-participant/model'

@Resolver(() => Board)
export class BoardResolver {
  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @Inject(forwardRef(() => UserService))
  private userService!: UserService

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => BoardTagService))
  private boardTagService!: BoardTagService

  @Inject(forwardRef(() => EventService))
  private eventService!: EventService

  @Inject(forwardRef(() => SubService))
  private subService!: SubService

  @Inject(forwardRef(() => BoardViewService))
  private boardViewService!: BoardViewService

  @Inject(forwardRef(() => BoardParticipantService))
  private boardParticipantService!: BoardParticipantService

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

  @ResolveField('timeExpiredEventsCount', () => Number)
  timeExpiredEventsCount(@Parent() board: Board) {
    return this.eventService.countTimeExpiredEventsByBoardId(board._id)
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

  @ResolveField('tags', () => [BoardTag])
  tags(@Parent() board: Board) {
    return this.boardTagService.getBoardTagsByIds(board.tagsIds)
  }

  @ResolveField('permissions', () => [Permission])
  permissions(
    @InjectUser() user: User | undefined,
    @InjectLinkToken() linkToken: string | undefined,
    @Parent() board: Board,
  ) {
    return this.boardService.getBoardPermissions(board, user, linkToken)
  }

  @ResolveField('views', () => Int)
  views(@Parent() board: Board) {
    return this.boardViewService.countViewsByBoardId(board._id)
  }

  @ResolveField('participants', () => BoardParticipantConnection)
  @UseInterceptors(ConnectionInterceptor)
  participants(@Parent() board: Board, @Args('page') page: Page) {
    return this.boardParticipantService.getBoardParticipants(board._id, page)
  }

  @ResolveField('participationSuggestion', () => Boolean)
  async participationSuggestion(
    @InjectUser() user: User | undefined,
    @InjectLinkToken() linkToken: string | undefined,
    @Parent() board: Board,
  ) {
    return this.boardService.getParticipationSuggestion(board._id, user?._id, linkToken)
  }

  @Query(() => Board, {nullable: true})
  @UseGuards(BoardGuard.for(BoardPermission.VIEW_BOARD))
  async board(
    @InjectUser() user: User | undefined,
    @Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId,
  ): Promise<Board | undefined> {
    const board = await this.boardService.board(boardId)

    if (board && user) {
      await this.boardViewService.trackBoardView(board, user._id)
    }

    return board
  }

  @Query(() => BoardConnection)
  @UseInterceptors(ConnectionInterceptor)
  boards(
    @InjectUser() user: User | undefined,
    @Args('page') page: Page,
    @Args('sort', {nullable: true}) sort?: BoardsSort,
    @Args('filter', {nullable: true}) filter?: BoardsFilter,
    @Args('search', {nullable: true}) search?: BoardsSearch,
  ): Promise<Board[]> {
    return this.boardService.boards(user, page, sort, filter, search)
  }

  @Query(() => BoardConnection)
  @UseInterceptors(ConnectionInterceptor)
  popularBoards(
    @InjectUser() user: User | undefined,
    @Args('page') page: Page,
    @Args('filter', {nullable: true}) filter?: BoardsFilter,
  ): Promise<Board[]> {
    return this.boardService.popular(user, page, filter)
  }

  @Query(() => BoardConnection)
  @UseInterceptors(ConnectionInterceptor)
  dashboard(
    @InjectUser() user: User | undefined,
    @Args('page') page: Page,
    @Args('sort', {nullable: true}) sort?: BoardsSort,
    @Args('filter', {nullable: true}) filter?: BoardsFilter,
    @Args('search', {nullable: true}) search?: BoardsSearch,
  ): Promise<Board[]> {
    return this.boardService.dashboard(user, page, sort, filter, search)
  }

  @Query(() => BoardConnection)
  @UseInterceptors(ConnectionInterceptor)
  @UseGuards(AuthGuard)
  my(
    @InjectUser() user: User,
    @Args('page') page: Page,
    @Args('search', {nullable: true}) search?: BoardsSearch,
  ): Promise<Board[]> {
    return this.boardService.my(user, page, search)
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
  @UseGuards(BoardGuard.for(BoardPermission.UPDATE_BOARD_DESCRIPTION))
  updateBoardTags(
    @Args('board', {type: () => UpdateBoardTags}, ParseObjectID.for(['_id']))
    board: UpdateBoardTags,
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
