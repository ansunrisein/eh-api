import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserModule} from '../user/module'
import {BoardModule} from '../board/module'
import {EventResolver} from './resolver'
import {EventService} from './service'
import {Event} from './model'
import {EventGuard} from './guards'
import {BoardLinkModule} from '../board-link/module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    forwardRef(() => BoardModule),
    forwardRef(() => BoardLinkModule),
    UserModule,
  ],
  providers: [EventResolver, EventService, EventGuard],
  exports: [EventService],
})
export class EventModule {}
