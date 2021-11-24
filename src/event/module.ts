import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserModule} from '../user/module'
import {BoardModule} from '../board/module'
import {EventResolver} from './resolver'
import {EventService} from './service'
import {Event} from './model'
import {CanGetEvent, CanUpdateEvent} from './guards'

@Module({
  imports: [TypeOrmModule.forFeature([Event]), forwardRef(() => BoardModule), UserModule],
  providers: [EventResolver, EventService, CanUpdateEvent, CanGetEvent],
  exports: [EventService],
})
export class EventModule {}
