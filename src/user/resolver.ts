import {Query} from '@nestjs/graphql'
import {forwardRef, Inject} from '@nestjs/common'
import {InjectUser} from '../auth/@InjectUser'
import {UserService} from './service'
import {User} from './model'

export class UserResolver {
  @Inject(forwardRef(() => UserService))
  private userService: UserService

  @Query(() => User, {nullable: true})
  me(@InjectUser() user: User | undefined): User | undefined {
    return user
  }
}
