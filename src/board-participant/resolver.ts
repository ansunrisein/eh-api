import {Mutation, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {BoardLink} from '../board-link/model'
import {AuthGuard} from '../auth/AuthGuard'
import {BoardParticipantService} from './service'
import {InjectLinkToken} from '../auth/@InjectLinkToken'
import {InjectUser} from '../auth/@InjectUser'
import {User} from '../user/model'
import {BoardParticipant, BoardParticipationDecline} from './model'

@Resolver(() => BoardLink)
export class BoardParticipantResolver {
  @Inject(forwardRef(() => BoardParticipantService))
  private boardParticipantService!: BoardParticipantService

  @Mutation(() => BoardParticipant, {nullable: true})
  @UseGuards(AuthGuard)
  acceptSuggestion(
    @InjectUser() user: User,
    @InjectLinkToken() linkToken: string | undefined,
  ): Promise<BoardParticipant | undefined> {
    return this.boardParticipantService.acceptSuggestion(user._id, linkToken)
  }

  @Mutation(() => BoardParticipationDecline, {nullable: true})
  @UseGuards(AuthGuard)
  declineSuggestion(
    @InjectUser() user: User,
    @InjectLinkToken() linkToken: string | undefined,
  ): Promise<BoardParticipationDecline | undefined> {
    return this.boardParticipantService.declineSuggestion(user._id, linkToken)
  }
}
