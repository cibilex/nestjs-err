import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    console.log(req.body);
    const token = req.headers.authorization;
    if (!token) return res.send('401 Unauthorized');
    else next();
  }
}
