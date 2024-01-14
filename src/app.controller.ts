import { Controller, Get } from '@nestjs/common';

@Controller({
  path: 'USER',
})
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'hi world';
  }
}
