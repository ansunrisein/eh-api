import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {MongoRepository} from 'typeorm'
import {getRepositoryToken} from '@nestjs/typeorm'
import {ObjectId} from 'mongodb'
import {BoardLinkService} from '../board-link/service'
import {BoardParticipant, BoardParticipationDecline} from './model'

@Injectable()
export class BoardParticipantService {
  @Inject(forwardRef(() => getRepositoryToken(BoardParticipant)))
  private boardParticipantRepository!: MongoRepository<BoardParticipant>

  @Inject(forwardRef(() => getRepositoryToken(BoardParticipant)))
  private boardParticipationDeclinesRepository!: MongoRepository<BoardParticipationDecline>

  @Inject(forwardRef(() => BoardLinkService))
  private boardLinkService!: BoardLinkService

  async getBoardParticipants(boardId: ObjectId): Promise<BoardParticipant[]> {
    return this.boardParticipantRepository.find({boardId})
  }

  async isParticipant(userId: ObjectId, boardId: ObjectId): Promise<boolean> {
    return this.boardParticipantRepository.findOne({userId, boardId}).then(Boolean)
  }

  async isSuggestionDeclined(userId: ObjectId, linkId: ObjectId): Promise<boolean> {
    return this.boardParticipationDeclinesRepository.findOne({userId, linkId}).then(Boolean)
  }

  async acceptSuggestion(
    userId: ObjectId,
    linkToken: string,
  ): Promise<BoardParticipant | undefined> {
    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return undefined
    }

    return this.boardParticipantRepository.save({
      userId,
      linkId: link._id,
      boardId: link.boardId,
    })
  }

  async declineSuggestion(
    userId: ObjectId,
    linkToken: string,
  ): Promise<BoardParticipationDecline | undefined> {
    const link = await this.boardLinkService.getBoardLinkByLink(linkToken)

    if (!link) {
      return undefined
    }

    return this.boardParticipationDeclinesRepository.save({
      userId,
      linkId: link._id,
    })
  }
}
