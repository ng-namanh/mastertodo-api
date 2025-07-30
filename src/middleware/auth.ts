import { Next } from 'koa';
import { AuthService } from '../services/auth';
import { DatabaseService } from '../services/database';
import { AuthContext } from '../types';

export const createAuthMiddleware = (authService: AuthService, dbService: DatabaseService) => {
  return async (ctx: AuthContext, next: Next): Promise<void> => {
    try {
      const authHeader = ctx.headers.authorization;
      console.log('Authorization header:', authHeader);
      if (!authHeader) {
        ctx.status = 401;
        ctx.body = { error: 'Authorization header required' };
        return;
      }

      const token = authService.extractTokenFromHeader(authHeader);
      if (!token) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid authorization header format' };
        return;
      }

      const payload = authService.verifyToken(token);
      if (!payload) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid or expired token' };
        return;
      }

      const user = await dbService.getUserById(payload.userId);
      if (!user) {
        ctx.status = 401;
        ctx.body = { error: 'User not found' };
        return;
      }

      const { password, ...userWithoutPassword } = user;
      ctx.user = userWithoutPassword as any;

      await next();
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  };
}; 