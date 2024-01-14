import { DynamicModule, Module, Provider } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

@Module({})
export class Env {
  private static config: dotenv.DotenvParseOutput;
  constructor() {}
  static register({
    global,
    path,
  }: {
    global?: boolean;
    path?: string;
  } = {}): DynamicModule {
    Env.config =
      dotenv.config({
        path: path || resolve(process.cwd(), '.env'),
      }).parsed || {};

    console.log(Env.config, 'config');
    const providers: Provider[] = [
      {
        provide: 'DOTENV',
        useValue: Env.config,
      },
    ];

    return {
      module: Env,
      global,
      providers,
      exports: providers,
    };
  }

  static get(key: string): string | undefined {
    return Env.config[key];
  }
}
