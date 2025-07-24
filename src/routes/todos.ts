import Router from 'koa-router';
import { DatabaseService } from '../services/database';
import { AuthContext, CreateTodoRequest, UpdateTodoRequest } from '../types';

export const createTodoRoutes = (dbService: DatabaseService): Router => {
  const router = new Router();

  /**
   * @swagger
   * /todos:
   *   get:
   *     summary: Get all todos
   *     description: Retrieve all todos with user information
   *     tags: [Todos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Todos retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TodosResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/', async (ctx: AuthContext) => {
    try {
      console.log('ctx.user', ctx.user);
      const todos = await dbService.getAllTodos();
      ctx.status = 200;
      ctx.body = {
        message: 'Todos retrieved successfully',
        todos
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });


  /**
   * @swagger
   * /todos:
   *   post:
   *     summary: Create new todo
   *     description: Create a new todo for the authenticated user
   *     tags: [Todos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTodoRequest'
   *     responses:
   *       201:
   *         description: Todo created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TodoResponse'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - user not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/', async (ctx: AuthContext) => {
    try {
      if (!ctx.user) {
        ctx.status = 401;
        ctx.body = { error: 'User not authenticated' };
        return;
      }
      const {
        title,
        description,
        dueDate,
        reminderDate,
        status,
        priority,
        starred,
        assignedTo,
        subtasks
      } = ctx.request.body as CreateTodoRequest;
      if (!title || title.trim().length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'Title is required' };
        return;
      }
      if (!dueDate) {
        ctx.status = 400;
        ctx.body = { error: 'Due date is required' };
        return;
      }
      const todo = await dbService.createTodo({
        title: title.trim(),
        description: description?.trim(),
        dueDate,
        reminderDate,
        status,
        priority,
        starred,
        creatorId: ctx.user.id,
        assignedTo,
        subtasks
      });
      ctx.status = 201;
      ctx.body = {
        message: 'Todo created successfully',
        todo
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  /**
   * @swagger
   * /my-todos:
   *   get:
   *     summary: Get current user's todos
   *     description: Retrieve todos belonging to the authenticated user
   *     tags: [Todos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User todos retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TodosResponse'
   *       401:
   *         description: Unauthorized - user not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/my-todos', async (ctx: AuthContext) => {
    try {
      if (!ctx.user) {
        ctx.status = 401;
        ctx.body = { error: 'User not authenticated' };
        return;
      }

      const todos = await dbService.getTodosByUserId(ctx.user.id);
      ctx.status = 200;
      ctx.body = {
        message: 'User todos retrieved successfully',
        todos
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  /**
   * @swagger
   * /todos/{id}:
   *   get:
   *     summary: Get specific todo by ID
   *     description: Retrieve a specific todo by its ID
   *     tags: [Todos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Todo ID
   *     responses:
   *       200:
   *         description: Todo retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TodoResponse'
   *       400:
   *         description: Bad request - invalid todo ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/:id', async (ctx: AuthContext) => {
    try {
      const todoId = parseInt(ctx.params.id);
      if (isNaN(todoId)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid todo ID' };
        return;
      }

      const todo = await dbService.getTodoById(todoId);
      if (!todo) {
        ctx.status = 404;
        ctx.body = { error: 'Todo not found' };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        message: 'Todo retrieved successfully',
        todo
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });



  /**
   * @swagger
   * /todos/{id}:
   *   put:
   *     summary: Update todo
   *     description: Update a specific todo (only by the owner)
   *     tags: [Todos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Todo ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTodoRequest'
   *     responses:
   *       200:
   *         description: Todo updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TodoResponse'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - user not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - user can only edit their own todos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put('/:id', async (ctx: AuthContext) => {
    try {
      if (!ctx.user) {
        ctx.status = 401;
        ctx.body = { error: 'User not authenticated' };
        return;
      }
      const todoId = parseInt(ctx.params.id);
      if (isNaN(todoId)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid todo ID' };
        return;
      }
      const existingTodo = await dbService.getTodoById(todoId);
      if (!existingTodo) {
        ctx.status = 404;
        ctx.body = { error: 'Todo not found' };
        return;
      }
      if (existingTodo.creatorId !== ctx.user.id) {
        ctx.status = 403;
        ctx.body = { error: 'You can only edit your own todos' };
        return;
      }
      const updates = ctx.request.body as UpdateTodoRequest;
      if (updates.title !== undefined && updates.title.trim().length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'Title cannot be empty' };
        return;
      }
      const updatedTodo = await dbService.updateTodo(todoId, updates);
      if (!updatedTodo) {
        ctx.status = 404;
        ctx.body = { error: 'Todo not found' };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        message: 'Todo updated successfully',
        todo: updatedTodo
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  /**
   * @swagger
   * /todos/{id}:
   *   delete:
   *     summary: Delete todo
   *     description: Delete a specific todo (only by the owner)
   *     tags: [Todos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Todo ID
   *     responses:
   *       200:
   *         description: Todo deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Todo deleted successfully"
   *       400:
   *         description: Bad request - invalid todo ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - user not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - user can only delete their own todos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete('/:id', async (ctx: AuthContext) => {
    try {
      if (!ctx.user) {
        ctx.status = 401;
        ctx.body = { error: 'User not authenticated' };
        return;
      }
      const todoId = parseInt(ctx.params.id);
      if (isNaN(todoId)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid todo ID' };
        return;
      }
      const existingTodo = await dbService.getTodoById(todoId);
      if (!existingTodo) {
        ctx.status = 404;
        ctx.body = { error: 'Todo not found' };
        return;
      }
      if (existingTodo.creatorId !== ctx.user.id) {
        ctx.status = 403;
        ctx.body = { error: 'You can only delete your own todos' };
        return;
      }
      const deleted = await dbService.deleteTodo(todoId);
      if (!deleted) {
        ctx.status = 404;
        ctx.body = { error: 'Todo not found' };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        message: 'Todo deleted successfully'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  return router;
}; 