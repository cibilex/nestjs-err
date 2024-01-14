import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Env } from 'src/lib/env';
@Controller({
  path: 'user',
})
export class UserController {
  constructor(private userService: UserService) {}
  text = '';

  @Get()
  @HttpCode(HttpStatus.BAD_REQUEST)
  async getAll() {
    return [this.userService.getUsers(), this.text, Env.get('PORT')];
  }

  @Post()
  async createUser(@Body() body: { username: string }) {
    this.text += 'cibilex';
    this.userService.createUser(body.username);
    return true;
  }
}
