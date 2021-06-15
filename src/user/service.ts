import { getRepositoryToken } from '@nestjs/typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { ObjectID } from 'mongodb';
import { User } from './model';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(User)))
    private userRepository: MongoRepository<User>,
  ) {}

  async create(
    user: Partial<Omit<User, 'providerId'>> & Pick<User, 'providerId'>,
  ): Promise<User> {
    return this.userRepository.save(user);
  }

  async getUserById(_id: ObjectID): Promise<User | undefined> {
    return this.userRepository.findOne({ _id });
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ providerId });
  }

  async updateProfile(
    nickname: string,
    name: string | undefined,
    user: User,
  ): Promise<User> {
    await this.userRepository.update({ _id: user._id }, { nickname, name });
    return User.merge(user, { nickname, name });
  }

  async updateAvatar(avatar: string | undefined, user: User) {
    await this.userRepository.update({ _id: user._id }, { avatar });
    return User.merge(user, { avatar });
  }
}
