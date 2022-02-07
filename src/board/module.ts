import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {EventModule} from '../event/module'
import {UserModule} from '../user/module'
import {BoardResolver} from './resolver'
import {BoardService} from './service'
import {Board, FavoriteBoard, PinBoard} from './model'
import {BoardGuard} from './guards'
import {BoardLinkModule} from '../board-link/module'
import {SubModule} from '../sub/module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    TypeOrmModule.forFeature([FavoriteBoard]),
    TypeOrmModule.forFeature([PinBoard]),
    forwardRef(() => EventModule),
    forwardRef(() => BoardLinkModule),
    forwardRef(() => SubModule),
    UserModule,
  ],
  providers: [BoardResolver, BoardService, BoardGuard],
  exports: [BoardService, BoardGuard],
})
export class BoardModule {}
