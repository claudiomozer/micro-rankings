import { Module } from '@nestjs/common';
import { RankingsModule } from './rankings/rankings.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

const connectionParams : object = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRoot(
      'mongodb+srv://' +
      `${process.env.DB_USER}:` +
      `${process.env.DB_PASS}@` +
      `${process.env.DB_HOST}/` +
      `${process.env.DB_NAME}?retryWrites=true&w=majority`
      , connectionParams),
    RankingsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
