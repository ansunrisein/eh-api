import {Args, Mutation, Query} from '@nestjs/graphql'
import {forwardRef, Inject} from '@nestjs/common'
import {InjectUser} from '../auth/@InjectUser'
import {UserService} from './service'
import {User} from './model'

export class UserResolver {
  @Inject(forwardRef(() => UserService))
  private userService!: UserService

  @Query(() => User, {nullable: true})
  me(@InjectUser() user: User | undefined): User | undefined {
    return user
  }

  @Mutation(() => User)
  updateProfile(
    @InjectUser() user: User,
    @Args('nickname') nickname: string,
    @Args('name', {type: () => String, nullable: true}) name: string | undefined,
  ) {
    return this.userService.updateProfile(nickname, name, user)
  }

  @Mutation(() => User)
  updateAvatar(@InjectUser() user: User, @Args('avatar', {nullable: true}) avatar: string) {
    return this.userService.updateAvatar(avatar, user)
  }
}
