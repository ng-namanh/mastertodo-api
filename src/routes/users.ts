import Router from 'koa-router';
import { DatabaseService } from '../services/database';
import { AuthContext } from '../types';

export const createUsersRoutes = (dbService: DatabaseService): Router => {
  const router = new Router({ prefix: '/users' });

  router.get('/', async (ctx: AuthContext) => {
    try {
      const users = await dbService.getAllUsers();
      ctx.status = 200;
      ctx.body = {
        message: 'Users retrieved successfully',
        data: {
          users
        },
        status: 200
      };
    } catch (error) {
      console.error('Error getting users:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  return router;
};
