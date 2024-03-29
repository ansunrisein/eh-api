import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {BoardLink} from './model'
import {BoardModule} from '../board/module'
import {UserModule} from '../user/module'
import {BoardLinkResolver} from './resolver'
import {BoardLinkService} from './service'
import {BoardLinkGuard} from './guards'
import {BoardParticipantModule} from '../board-participant/module'

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardLink]),
    forwardRef(() => BoardModule),
    forwardRef(() => BoardParticipantModule),
    UserModule,
  ],
  providers: [BoardLinkResolver, BoardLinkService, BoardLinkGuard],
  exports: [BoardLinkService],
})
export class BoardLinkModule {}
