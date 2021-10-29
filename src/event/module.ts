import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserModule} from '../user/module'
import {EventResolver} from './resolver'
import {EventService} from './service'
import {Event} from './model'

@Module({
  imports: [TypeOrmModule.forFeature([Event]), UserModule],
  providers: [EventResolver, EventService],
  exports: [EventService],
})
export class EventModule {}
