import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Page } from '../pagination/Page';
import { User } from '../user/model';
import { Event } from '../event/model';
import { Board, CreateBoard, UpdateBoard } from './model';
import { BoardsFilter } from './BoardsFilter';
import { BoardsSort } from './BoardsSort';
import { ObjectID } from 'mongodb';
import { EventService } from '../event/service';

@Injectable()
export class BoardService {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(Board)))
    private boardRepository: MongoRepository<Board>,
    private eventService: EventService,
  ) {}

  async board(_id: ObjectID): Promise<Board | undefined> {
    return this.boardRepository.findOne({ _id });
  }

  async dashboard(
    user: User,
    filter: BoardsFilter,
    sort: BoardsSort,
    { first = 25, after = '000000000000' }: Page,
  ): Promise<Board[] | undefined> {
    return this.boardRepository
      .aggregateEntity([
        {
          $match: {
            userId: user._id,
          },
        },
        {
          $match: {
            _id: {
              $gt: new ObjectID(after),
            },
          },
        },
        {
          $limit: first,
        },
      ])
      .toArray();
  }

  async events(boardId: ObjectID, page: Page): Promise<Event[]> {
    return this.eventService.getEventsByBoardId(boardId, page);
  }

  async createBoard(
    user: User,
    board: CreateBoard,
  ): Promise<Board | undefined> {
    return this.boardRepository.save({
      ...board,
      userId: user._id,
      pinned: false,
      favorite: false,
      private: false,
    });
  }

  // TODO: replace with soft deleting
  async removeBoard(user: User, _id: ObjectID): Promise<Board | undefined> {
    const board = await this.boardRepository.findOne({ _id });
    await this.boardRepository.deleteOne({ _id });
    return board;
  }

  async updateBoard(
    user: User,
    board: UpdateBoard,
  ): Promise<Board | undefined> {
    const oldBoard = await this.boardRepository.findOne({
      _id: board._id,
      userId: user._id,
    });
    await this.boardRepository.update({ _id: board._id }, board);
    return Board.merge(oldBoard, board);
  }
}
