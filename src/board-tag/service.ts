import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {getRepositoryToken} from '@nestjs/typeorm'
import {MongoRepository} from 'typeorm'
import {BoardTag} from './model'
import {ObjectId} from 'mongodb'

@Injectable()
export class BoardTagService {
  @Inject(forwardRef(() => getRepositoryToken(BoardTag)))
  private boardTagRepository!: MongoRepository<BoardTag>

  async createBoardTag(name: string): Promise<BoardTag> {
    return this.boardTagRepository.save({name})
  }

  async removeBoardTag(_id: ObjectId): Promise<BoardTag | undefined> {
    const tag = await this.boardTagRepository.findOne({_id})
    await this.boardTagRepository.deleteOne({_id})
    return tag
  }

  async getBoardTags(): Promise<BoardTag[] | undefined> {
    return this.boardTagRepository.find()
  }
}
