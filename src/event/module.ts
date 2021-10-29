import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {EventResolver} from './resolver'
import {EventService} from './service'
import {Event} from './model'

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventResolver, EventService],
  exports: [EventService],
})
export class EventModule {}
