import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventResolver } from './resolver';
import { EventService } from './service';
import { Event } from './model';
import { UserModule } from '../user/module';
import { BoardModule } from '../board/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    UserModule,
    forwardRef(() => BoardModule),
  ],
  providers: [EventResolver, EventService],
  exports: [EventService],
})
export class EventModule {}
