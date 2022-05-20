import {Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {AuthGuard} from '../auth/AuthGuard'
import {InjectLinkToken} from '../auth/@InjectLinkToken'
import {InjectUser} from '../auth/@InjectUser'
import {UserService} from '../user/service'
import {User} from '../user/model'
import {BoardParticipant, BoardParticipationDecline} from './model'
import {BoardParticipantService} from './service'
import {BoardParticipantGuard} from './guards'
import {BoardParticipantPermission} from './permissions'

@Resolver(() => BoardParticipant)
export class BoardParticipantResolver {
  @Inject(forwardRef(() => BoardParticipantService))
  private boardParticipantService!: BoardParticipantService

  @Inject(forwardRef(() => UserService))
  private userService!: UserService

  @ResolveField('user', () => User)
  user(@Parent() boardParticipant: BoardParticipant) {
    return this.userService.getUserById(boardParticipant.userId)
  }

  @Mutation(() => BoardParticipant, {nullable: true})
  @UseGuards(
    AuthGuard,
    BoardParticipantGuard.for(BoardParticipantPermission.ACCEPT_OR_DECLINE_PARTICIPATION),
  )
  acceptSuggestion(
    @InjectUser() user: User,
    @InjectLinkToken() linkToken: string,
  ): Promise<BoardParticipant | undefined> {
    return this.boardParticipantService.acceptSuggestion(user._id, linkToken)
  }

  @Mutation(() => BoardParticipationDecline, {nullable: true})
  @UseGuards(
    AuthGuard,
    BoardParticipantGuard.for(BoardParticipantPermission.ACCEPT_OR_DECLINE_PARTICIPATION),
  )
  declineSuggestion(
    @InjectUser() user: User,
    @InjectLinkToken() linkToken: string,
  ): Promise<BoardParticipationDecline | undefined> {
    return this.boardParticipantService.declineSuggestion(user._id, linkToken)
  }
}
