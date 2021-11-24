import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {EventModule} from '../event/module'
import {UserModule} from '../user/module'
import {CanGetBoard, CanUpdateBoard} from './guards'
import {BoardResolver} from './resolver'
import {BoardService} from './service'
import {Board} from './model'

@Module({
  imports: [TypeOrmModule.forFeature([Board]), forwardRef(() => EventModule), UserModule],
  providers: [BoardResolver, BoardService, CanUpdateBoard, CanGetBoard],
  exports: [BoardService],
})
export class BoardModule {}
