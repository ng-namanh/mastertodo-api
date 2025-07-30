import Router from 'koa-router';
import { DatabaseService } from '../services/database';
import { AuthContext } from '../types';

export const createUsersRoutes = (dbService: DatabaseService): Router => {
  const router = new Router({ prefix: '/users' });

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users
   *     description: Retrieve all users for assignment and filtering purposes
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Users retrieved successfully"
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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
