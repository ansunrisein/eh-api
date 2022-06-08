import {Args, ID, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql'
import {forwardRef, Inject, UseGuards} from '@nestjs/common'
import {ParseObjectID} from '../shared/pipes'
import {AuthGuard} from '../auth/AuthGuard'
import {InjectLinkToken} from '../auth/@InjectLinkToken'
import {InjectUser} from '../auth/@InjectUser'
import {UserService} from '../user/service'
import {User} from '../user/model'
import {BoardParticipant, BoardParticipationDecline, RemoveBoardParticipants} from './model'
import {BoardParticipantService} from './service'
import {BoardParticipantGuard} from './guards'
import {BoardParticipantPermission} from './permissions'
import {Board} from '../board/model'
import {ObjectId} from 'mongodb'
import {BoardService} from '../board/service'

@Resolver(() => BoardParticipant)
export class BoardParticipantResolver {
  @Inject(forwardRef(() => BoardParticipantService))
  private boardParticipantService!: BoardParticipantService

  @Inject(forwardRef(() => UserService))
  private userService!: UserService

  @Inject(forwardRef(() => BoardService))
  private boardService!: BoardService

  @ResolveField('user', () => User)
  user(@Parent() boardParticipant: BoardParticipant) {
    return this.userService.getUserById(boardParticipant.userId)
  }

  @ResolveField('board', () => Board)
  board(@Parent() boardParticipant: BoardParticipant) {
    return this.boardService.board(boardParticipant.boardId)
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

  @Mutation(() => [BoardParticipant])
  @UseGuards(AuthGuard)
  removeBoardParticipants(
    @InjectUser() user: User,
    @Args(
      'board',
      {type: () => RemoveBoardParticipants},
      ParseObjectID.for(['_id', 'participantsId']),
    )
    board: RemoveBoardParticipants,
  ): Promise<BoardParticipant[]> {
    return this.boardParticipantService.removeParticipantsByIds(board._id, board.participantsId)
  }

  @Mutation(() => BoardParticipant)
  @UseGuards(AuthGuard)
  leaveBoard(
    @InjectUser() user: User,
    @Args('boardId', {type: () => ID}, ParseObjectID) boardId: ObjectId,
  ): Promise<BoardParticipant | undefined> {
    return this.boardParticipantService.leaveBoard(boardId, user._id)
  }
}
