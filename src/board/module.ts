import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {EventModule} from '../event/module'
import {UserModule} from '../user/module'
import {BoardResolver} from './resolver'
import {BoardService} from './service'
import {Board} from './model'
import {BoardGuard} from './guards'
import {BoardLinkModule} from '../board-link/module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    forwardRef(() => EventModule),
    forwardRef(() => BoardLinkModule),
    UserModule,
  ],
  providers: [BoardResolver, BoardService, BoardGuard],
  exports: [BoardService],
})
export class BoardModule {}
