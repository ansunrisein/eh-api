import {Args, ID, Mutation, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {Board} from '../board/model'
import {BoardService} from '../board/service'
import {ParseObjectID} from '../shared/pipes'
import {BoardLink, CreateBoardLink, UpdateBoardLink} from './model'
import {BoardLinkService} from './service'
import {BoardLinkGuard} from './guards'
import {BoardLinkPermission} from './permissions'

@Resolver(() => BoardLink)
export class BoardLinkResolver {
  @Inject(forwardRef(() => BoardLinkService))
  public boardLinkService!: BoardLinkService

  @Inject(forwardRef(() => BoardService))
  public boardService!: BoardService

  @ResolveField('board', () => Board)
  board(@Parent() boardLink: BoardLink) {
    return this.boardService.board(boardLink.boardId)
  }

  @Query(() => [BoardLink])
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.VIEW_BOARD_LINK))
  boardLinks(
    @Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId,
    @Args('linkToken', {nullable: true, type: () => String}) linkToken: never,
  ) {
    return this.boardLinkService.getBoardLinksByBoardId(boardId)
  }

  @Mutation(() => BoardLink)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.CREATE_BOARD_LINK))
  createBoardLink(
    @Args('boardLink', {type: () => CreateBoardLink}, ParseObjectID.for(['boardId']))
    boardLink: CreateBoardLink,
    @Args('linkToken', {nullable: true, type: () => String}) linkToken: never,
  ) {
    return this.boardLinkService.createBoardLink(boardLink)
  }

  @Mutation(() => BoardLink)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.UPDATE_BOARD_LINK))
  updateBoardLink(
    @Args('boardLink', {type: () => UpdateBoardLink}, ParseObjectID.for(['_id']))
    boardLink: UpdateBoardLink,
    @Args('linkToken', {nullable: true, type: () => String}) linkToken: never,
  ) {
    return this.boardLinkService.updateBoardLink(boardLink)
  }

  @Mutation(() => BoardLink)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.DELETE_BOARD_LINK))
  removeBoardLink(
    @Args('boardLinkId', {type: () => ID}, ParseObjectID) boardLinkId: ObjectId,
    @Args('linkToken', {nullable: true, type: () => String}) linkToken: never,
  ) {
    return this.boardLinkService.removeBoard(boardLinkId)
  }
}
