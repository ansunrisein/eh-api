import {getRepositoryToken} from '@nestjs/typeorm'
import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {MongoRepository} from 'typeorm'
import {User} from './model'

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(User)))
    private userRepository: MongoRepository<User>,
  ) {}

  async create(user: Partial<Omit<User, 'providerId'>> & Pick<User, 'providerId'>): Promise<User> {
    return this.userRepository.save(user)
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    return this.userRepository.findOne({providerId})
  }
}
