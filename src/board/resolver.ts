import {Args, ID, Mutation, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql'
import {UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {AuthGuard} from '../auth/AuthGuard'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {ParseObjectID} from '../shared/pipes'
import {Event} from '../event/model'
import {CanGetBoard, CanUpdateBoard} from './guards'
import {BoardService} from './service'
import {Board, CreateBoard, UpdateBoard} from './model'
import {UserService} from '../user/service'

@Resolver(() => Board)
export class BoardResolver {
  constructor(private boardService: BoardService, private userService: UserService) {}

  @ResolveField('events', () => [Event])
  events(@Parent() board: Board) {
    return this.boardService.events(board._id)
  }

  @ResolveField('user', () => User)
  user(@Parent() board: Board) {
    return this.userService.getUserById(board.userId)
  }

  @Query(() => Board)
  @UseGuards(CanGetBoard)
  board(@Args('_id', {type: () => ID}, ParseObjectID) _id: ObjectId): Promise<Board | undefined> {
    return this.boardService.board(_id)
  }

  @Query(() => [Board])
  async dashboard(@InjectUser() user: User | undefined): Promise<Board[] | undefined> {
    return await this.boardService.dashboard(user)
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard)
  createBoard(@InjectUser() user: User, @Args() board: CreateBoard): Promise<Board | undefined> {
    return this.boardService.createBoard(user, board)
  }

  @Mutation(() => Board)
  @UseGuards(CanUpdateBoard)
  removeBoard(
    @InjectUser() user: User,
    @Args('_id', {type: () => ID}, ParseObjectID) _id: ObjectId,
  ): Promise<Board | undefined> {
    return this.boardService.removeBoard(user, _id)
  }

  @Mutation(() => Board)
  @UseGuards(CanUpdateBoard)
  updateBoard(
    @InjectUser() user: User,
    @Args(ParseObjectID.for(['_id'])) board: UpdateBoard,
  ): Promise<Board | undefined> {
    return this.boardService.updateBoard(user, board)
  }
}
