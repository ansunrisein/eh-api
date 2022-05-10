import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {BoardView} from './model'
import {BoardViewService} from './service'

@Module({
  imports: [TypeOrmModule.forFeature([BoardView])],
  providers: [BoardViewService],
  exports: [BoardViewService],
})
export class BoardViewModule {}
