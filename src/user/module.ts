import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResolver } from './resolver';
import { UserService } from './service';
import { User } from './model';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
