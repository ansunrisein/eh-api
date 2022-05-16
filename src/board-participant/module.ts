import {forwardRef, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {BoardParticipantService} from './service'
import {BoardParticipant, BoardParticipationDecline} from './model'
import {BoardLinkModule} from '../board-link/module'
import {BoardParticipantResolver} from './resolver'

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardParticipant, BoardParticipationDecline]),
    forwardRef(() => BoardLinkModule),
  ],
  providers: [BoardParticipantService, BoardParticipantResolver],
  exports: [BoardParticipantService],
})
export class BoardParticipantModule {}
