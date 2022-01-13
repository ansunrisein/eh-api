import {getRepositoryToken} from '@nestjs/typeorm'
import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {MongoRepository} from 'typeorm'
import {ObjectId} from 'mongodb'
import {User} from './model'

@Injectable()
export class UserService {
  @Inject(forwardRef(() => getRepositoryToken(User)))
  private userRepository!: MongoRepository<User>

  async create(user: Partial<Omit<User, 'providerId'>> & Pick<User, 'providerId'>): Promise<User> {
    return this.userRepository.save(user)
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    return this.userRepository.findOne({providerId})
  }

  async getUserById(_id: ObjectId): Promise<User | undefined> {
    return this.userRepository.findOne({_id})
  }

  async updateProfile(nickname: string, name: string | undefined, user: User): Promise<User> {
    await this.userRepository.update({_id: user._id}, {nickname, name})
    return User.merge(user, {nickname, name})
  }

  async updateAvatar(avatar: string | undefined, user: User) {
    await this.userRepository.update({_id: user._id}, {avatar})
    return User.merge(user, {avatar})
  }
}
