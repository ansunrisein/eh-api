import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardResolver } from './resolver';
import { BoardService } from './service';
import { Board } from './model';
import { EventModule } from '../event/module';
import { CanUpdateBoard } from './CanUpdateBoard';
import { UserModule } from '../user/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    forwardRef(() => EventModule),
    UserModule,
  ],
  providers: [BoardResolver, BoardService, CanUpdateBoard],
  exports: [BoardService],
})
export class BoardModule {}
