import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ParseObjectID} from '../shared/pipes'
import {SubService} from './service'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {CreateSub, Sub} from './model'
import {SubGuard} from './guards'
import {SubPermission} from './permissions'
import {Board, BoardId} from '../board/model'

@Resolver(() => Sub)
export class SubResolver {
  @Inject(forwardRef(() => SubService))
  subService!: SubService

  @Mutation(() => Board)
  @UseGuards(SubGuard.for(SubPermission.CREATE_SUB))
  async createSub(
    @InjectUser() user: User,
    @Args('sub', {type: () => CreateSub}, ParseObjectID.for('boardId')) sub: CreateSub,
  ): Promise<Board | undefined> {
    return this.subService.createSub(user._id, sub.boardId)
  }

  @Mutation(() => Board)
  @UseGuards(SubGuard.for(SubPermission.REMOVE_SUB))
  async removeSub(
    @InjectUser() user: User,
    @Args('board', {type: () => BoardId}, ParseObjectID.for('_id')) board: BoardId,
  ): Promise<Board | undefined> {
    return this.subService.removeSub(user._id, board._id)
  }
}
