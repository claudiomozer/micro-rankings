import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { RankingSchema } from './interfaces/ranking.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientAdminBackendService } from 'src/infrastructure/services/client-admin-backend.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Ranking', schema: RankingSchema}])
  ],
  providers: [RankingsService, ClientAdminBackendService],
  controllers: [RankingsController]
})
export class RankingsModule {}
