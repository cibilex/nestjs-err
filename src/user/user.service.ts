import { Injectable } from '@nestjs/common';

@Injectable({})
export class UserService {
  private users: string[] = [];

  getUsers() {
    return this.users;
  }

  createUser(username: string) {
    this.users.push(username);
  }
}
