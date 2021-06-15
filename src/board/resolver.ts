import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { AuthGuard } from '../auth/AuthGuard';
import { InjectUser } from '../auth/@InjectUser';
import { Page } from '../pagination/Page';
import { User } from '../user/model';
import { ParseObjectID } from '../ParseObjectID';
import { BoardsFilter } from './BoardsFilter';
import { BoardsSort } from './BoardsSort';
import { BoardService } from './service';
import { Board, BoardConnection, CreateBoard, UpdateBoard } from './model';
import { ConnectionInterceptor } from 'src/pagination/ConnectionInterceptor';
import { EventConnection } from '../event/model';
import { CanUpdateBoard } from './CanUpdateBoard';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private boardService: BoardService) {}

  @ResolveField('events', () => EventConnection)
  @UseInterceptors(ConnectionInterceptor)
  events(@Parent() board: Board, @Args('page') page: Page) {
    return this.boardService.events(board._id, page);
  }

  @Query(() => Board)
  board(
    @Args('_id', { type: () => ID }, ParseObjectID) _id: ObjectID,
  ): Promise<Board | undefined> {
    return this.boardService.board(_id);
  }

  @Query(() => BoardConnection)
  @UseInterceptors(ConnectionInterceptor)
  @UseGuards(AuthGuard)
  async dashboard(
    @InjectUser() user: User,
    @Args('page') page: Page,
    @Args('filter', { nullable: true }) filter?: BoardsFilter,
    @Args('sort', { nullable: true }) sort?: BoardsSort,
  ): Promise<Board[] | undefined> {
    return await this.boardService.dashboard(user, filter, sort, page);
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard)
  createBoard(
    @InjectUser() user: User,
    @Args() board: CreateBoard,
  ): Promise<Board | undefined> {
    return this.boardService.createBoard(user, board);
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard)
  removeBoard(
    @InjectUser() user: User,
    @Args('_id', { type: () => ID }, ParseObjectID) _id: ObjectID,
  ): Promise<Board | undefined> {
    return this.boardService.removeBoard(user, _id);
  }

  @Mutation(() => Board)
  @UseGuards(CanUpdateBoard)
  updateBoard(
    @InjectUser() user: User,
    @Args(ParseObjectID.for(['_id'])) board: UpdateBoard,
  ): Promise<Board | undefined> {
    return this.boardService.updateBoard(user, board);
  }
}
