import {Args, Field, ID, InputType, Mutation, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ParseObjectID} from '../shared/pipes'
import {SubService} from './service'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {ObjectId} from 'mongodb'
import {CreateSub, Sub} from './model'
import {SubGuard} from './guards'
import {SubPermission} from './permissions'

@InputType()
export class RemoveSub {
  @Field(() => ID)
  _id!: ObjectId
}

@Resolver(() => Sub)
export class SubResolver {
  @Inject(forwardRef(() => SubService))
  subService!: SubService

  @Mutation(() => Sub)
  @UseGuards(SubGuard.for(SubPermission.CREATE_SUB))
  async createSub(
    @InjectUser() user: User,
    @Args('sub', {type: () => CreateSub}, ParseObjectID.for('boardId')) sub: CreateSub,
  ): Promise<Sub | undefined> {
    return this.subService.createSub(sub.boardId, user._id)
  }

  @Mutation(() => Sub)
  @UseGuards(SubGuard.for(SubPermission.REMOVE_SUB))
  async removeSub(
    @Args('sub', {type: () => RemoveSub}, ParseObjectID.for('_id')) sub: RemoveSub,
  ): Promise<Sub | undefined> {
    return this.subService.removeSub(sub._id)
  }
}
