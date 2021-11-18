import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { RankingSchema } from './interfaces/ranking.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientAdminBackendService } from 'src/infrastructure/services/client-admin-backend.service';
import { ClientDesafiosService } from 'src/infrastructure/services/client-desafios.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Ranking', schema: RankingSchema}])
  ],
  providers: [RankingsService, ClientAdminBackendService, ClientDesafiosService],
  controllers: [RankingsController]
})
export class RankingsModule {}
