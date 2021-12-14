import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {SubResolver} from './resolver'
import {SubService} from './service'
import {Sub} from './model'
import {SubGuard} from './guards'
import {BoardModule} from '../board/module'

@Module({
  imports: [TypeOrmModule.forFeature([Sub]), forwardRef(() => BoardModule)],
  providers: [SubResolver, SubService, SubGuard],
  exports: [SubService],
})
export class SubModule {}
