import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {BoardTag} from './model'
import {BoardTagService} from './service'
import {BoardTagResolver} from './resolver'

@Module({
  imports: [TypeOrmModule.forFeature([BoardTag])],
  providers: [BoardTagResolver, BoardTagService],
  exports: [BoardTagService],
})
export class BoardTagModule {}
