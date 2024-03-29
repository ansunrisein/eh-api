import {ExecutionContext, forwardRef, Inject, Injectable} from '@nestjs/common'
import {getRepositoryToken} from '@nestjs/typeorm'
import {MongoRepository} from 'typeorm'
import {ObjectId} from 'mongodb'
import {
  BoardLink,
  CreateBoardLink,
  EntityName,
  EntityPermissions,
  Permission,
  permissions,
  UpdateBoardLink,
} from './model'
import {randomUUID} from 'crypto'
import {Page} from '../pagination/model'

@Injectable()
export class BoardLinkService {
  @Inject(forwardRef(() => getRepositoryToken(BoardLink)))
  private boardLinkRepository!: MongoRepository<BoardLink>

  static isAvailablePermission = <T>(perm: T): perm is T & Permission => {
    return (
      !!perm && typeof perm === 'string' && (Object.values(Permission) as unknown[]).includes(perm)
    )
  }

  static extractBoardLinkId(context: ExecutionContext): ObjectId | undefined {
    const args = context.getArgByIndex(1)
    const id = args.boardLink?._id || args.boardLinkId
    return id && new ObjectId(id)
  }

  static extractLinkToken(context: ExecutionContext): string | undefined {
    return context.getArgByIndex(2).linkToken
  }

  async getPermissions(): Promise<EntityPermissions[]> {
    return Object.entries(permissions).map(([name, permissions]) => ({
      name: name as EntityName,
      permissions: Object.keys(permissions) as Permission[],
    }))
  }

  async getBoardLinksByBoardId(
    boardId: ObjectId,
    {first, after = '000000000000'}: Page,
  ): Promise<BoardLink[]> {
    return this.boardLinkRepository
      .aggregateEntity([
        {$match: {boardId}},
        {$match: {_id: {$gt: new ObjectId(after)}}},
        {$limit: first},
      ])
      .toArray()
  }

  async getBoardLink(_id: ObjectId): Promise<BoardLink | undefined> {
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
