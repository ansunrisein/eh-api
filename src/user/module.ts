import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserService} from './service'
import {User} from './model'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
