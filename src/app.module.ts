import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { Env } from './lib/env';
import { AuthenticateMiddleware } from './authenticate/authenticate.middleware';

@Module({
  imports: [
    UserModule,
    Env.register({
      global: true,
    }),
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes('*');
  }
}
