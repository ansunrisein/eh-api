import {ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {getRepositoryToken} from '@nestjs/typeorm'
import {MongoRepository} from 'typeorm'
import {ObjectId} from 'mongodb'
import {BoardLink, CreateBoardLink, UpdateBoardLink} from './model'
import {randomUUID} from 'crypto'

@Injectable()
export class BoardLinkService {
  @Inject(forwardRef(() => getRepositoryToken(BoardLink)))
  private boardLinkRepository!: MongoRepository<BoardLink>

  static extractBoardLinkId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardLink?._id || args.boardLinkId
    return id && new ObjectId(id)
  }

  static extractLinkToken(context: ExecutionContext): string | undefined {
    const args = context.getArgByIndex(1)
    return args.linkToken || args.boardLink?.token
  }

  async getBoardLinksByBoardId(boardId: ObjectId): Promise<BoardLink[]> {
    return this.boardLinkRepository.find({boardId})
  }

  async boardLink(_id: ObjectId): Promise<BoardLink | undefined> {
    return this.boardLinkRepository.findOne({_id})
  }

  async getBoardLinkByLink(link: string): Promise<BoardLink | undefined> {
    return this.boardLinkRepository.findOne({link})
  }

  async createBoardLink(link: CreateBoardLink) {
    return this.boardLinkRepository.save({
      ...link,
      link: randomUUID(),
    })
  }

  async updateBoardLink({_id, ...link}: UpdateBoardLink): Promise<BoardLink | undefined> {
    const oldLink = await this.boardLinkRepository.findOne({_id})

    if (!oldLink) {
      return undefined
    }

    await this.boardLinkRepository.update({_id}, link)

    return BoardLink.merge(oldLink, link)
  }

  async removeBoard(_id: ObjectId): Promise<BoardLink | undefined> {
    const link = await this.boardLinkRepository.findOne({_id})
    await this.boardLinkRepository.deleteOne({_id})
    return link
  }
}
