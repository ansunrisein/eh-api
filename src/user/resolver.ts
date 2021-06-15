import { Args, Mutation, Query } from '@nestjs/graphql';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { InjectUser } from '../auth/@InjectUser';
import { AuthGuard } from '../auth/AuthGuard';
import { UserService } from './service';
import { User } from './model';

export class UserResolver {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  @Query(() => User, { nullable: true })
  me(@InjectUser() user: User | undefined): Promise<User | undefined> {
    return this.userService.getUserById(user._id);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  updateProfile(
    @Args('nickname') nickname: string,
    @Args('name', { nullable: true }) name: string | undefined,
    @InjectUser() user: User,
  ) {
    return this.userService.updateProfile(nickname, name, user);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  updateAvatar(
    @Args('avatar', { nullable: true }) avatar: string,
    @InjectUser() user: User,
  ) {
    return this.userService.updateAvatar(avatar, user);
  }
}
