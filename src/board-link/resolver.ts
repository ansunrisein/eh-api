import {Args, ID, Mutation, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {Board} from '../board/model'
import {BoardService} from '../board/service'
import {ParseObjectID} from '../shared/pipes'
import {BoardLink, CreateBoardLink, EntityPermissions, UpdateBoardLink} from './model'
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

  @Query(() => [EntityPermissions])
  permissions() {
    return this.boardLinkService.getPermissions()
  }

  @Query(() => BoardLink, {nullable: true})
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.VIEW_BOARD_LINK))
  boardLink(@Args('boardLinkId', {type: () => ID}, ParseObjectID) boardLinkId: ObjectId) {
    return this.boardLinkService.getBoardLink(boardLinkId)
  }

  @Query(() => [BoardLink])
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.VIEW_BOARD_LINK))
  boardLinks(@Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId) {
    return this.boardLinkService.getBoardLinksByBoardId(boardId)
  }

  @Mutation(() => BoardLink)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.CREATE_BOARD_LINK))
  createBoardLink(
    @Args('boardLink', {type: () => CreateBoardLink}, ParseObjectID.for(['boardId']))
    boardLink: CreateBoardLink,
  ) {
    return this.boardLinkService.createBoardLink(boardLink)
  }

  @Mutation(() => BoardLink)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.UPDATE_BOARD_LINK))
  updateBoardLink(
    @Args('boardLink', {type: () => UpdateBoardLink}, ParseObjectID.for(['_id']))
    boardLink: UpdateBoardLink,
  ) {
    return this.boardLinkService.updateBoardLink(boardLink)
  }

  @Mutation(() => BoardLink)
  @UseGuards(BoardLinkGuard.for(BoardLinkPermission.REMOVE_BOARD_LINK))
  removeBoardLink(@Args('boardLinkId', {type: () => ID}, ParseObjectID) boardLinkId: ObjectId) {
    return this.boardLinkService.removeBoard(boardLinkId)
  }
}
