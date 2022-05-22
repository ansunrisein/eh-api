import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {BoardTagService} from './service'
import {BoardTag, BoardTagId, CreateBoardTag} from './model'
import {ParseObjectID} from '../shared/pipes'
import {BoardTagGuard} from './guards'

@Resolver(() => BoardTag)
export class BoardTagResolver {
  @Inject(forwardRef(() => BoardTagService))
  public boardTagService!: BoardTagService

  @Query(() => [BoardTag])
  boardTags(): Promise<BoardTag[] | undefined> {
    return this.boardTagService.getBoardTags()
  }

  @Mutation(() => BoardTag)
  @UseGuards(BoardTagGuard)
  createBoardTag(
    @Args('boardTag', {type: () => CreateBoardTag}) boardTag: CreateBoardTag,
  ): Promise<BoardTag> {
    return this.boardTagService.createBoardTag(boardTag.name)
  }

  @Mutation(() => BoardTag)
  @UseGuards(BoardTagGuard)
  removeBoardTag(
    @Args('boardTag', {type: () => BoardTagId}, ParseObjectID.for(['_id'])) boardTag: BoardTagId,
  ): Promise<BoardTag | undefined> {
    return this.boardTagService.removeBoardTag(boardTag._id)
  }
}
