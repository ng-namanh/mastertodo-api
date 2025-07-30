import Router from 'koa-router';
import { DatabaseService } from '../services/database';
import { AuthContext, CreateTodoRequest, UpdateTodoRequest } from '../types';

export const createTodoRoutes = (dbService: DatabaseService): Router => {
  const router = new Router({ prefix: '/todos' });

  /**
   * @swagger
   * /todos:
   *   get:
   *     summary: Get all todos
   *     description: Retrieve all todos with user information and optional filtering
   *     tags: [Todos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [all, PENDING, IN_PROGRESS, COMPLETED]
   *         style: form
   *         explode: false
   *         description: Filter by status (comma-separated for multiple values)
   *         example: "PENDING,IN_PROGRESS"
   *       - in: query
   *         name: assignedTo
   *         schema:
   *           type: array
   *           items:
   *             type: integer
   *         style: form
   *         explode: false
   *         description: Filter by assigned user IDs (comma-separated for multiple values)
   *         example: "1,2,3"
   *       - in: query
   *         name: starred
   *         schema:
   *           type: boolean
   *         description: Filter by starred status
   *         example: true
   *       - in: query
   *         name: priority
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [HIGH, MEDIUM, LOW]
   *         style: form
   *         explode: false
   *         description: Filter by priority (comma-separated for multiple values)
   *         example: "HIGH,MEDIUM"
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

      // Parse query parameters for filtering
      const filters: any = {};

      // Status filter
      if (ctx.query.status) {
        const statusArray = typeof ctx.query.status === 'string'
          ? ctx.query.status.split(',').map(s => s.trim())
          : ctx.query.status;
        filters.status = statusArray;
      }

      // Assigned users filter
      if (ctx.query.assignedTo) {
        const assignedToArray = typeof ctx.query.assignedTo === 'string'
          ? ctx.query.assignedTo.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : Array.isArray(ctx.query.assignedTo)
            ? ctx.query.assignedTo.map(id => parseInt(id as string)).filter(id => !isNaN(id))
            : [parseInt(ctx.query.assignedTo as string)].filter(id => !isNaN(id));
        if (assignedToArray.length > 0) {
          filters.assignedTo = assignedToArray;
        }
      }

      // Starred filter
      if (ctx.query.starred !== undefined) {
        filters.starred = ctx.query.starred === 'true';
      }

      // Priority filter
      if (ctx.query.priority) {
        const priorityArray = typeof ctx.query.priority === 'string'
          ? ctx.query.priority.split(',').map(p => p.trim().toUpperCase())
          : ctx.query.priority;
        filters.priority = priorityArray;
      }

      const todos = await dbService.getAllTodos(Object.keys(filters).length > 0 ? filters : undefined);
      ctx.status = 200;
      ctx.body = {
        message: 'Todos retrieved successfully',
        data: {
          todos,
          filters: filters // Include applied filters in response for debugging
        },
        status: 200
      };
    } catch (error) {
      console.error('Error getting todos:', error);
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'Failed to retrieve todos',
        status: 500
      };
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
        ctx.body = {
          error: 'Unauthorized',
          message: 'User not authenticated',
          status: 401
        };
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
        ctx.body = {
          error: 'Validation Error',
          message: 'Title is required',
          status: 400
        };
        return;
      }
      if (!dueDate) {
        ctx.status = 400;
        ctx.body = {
          error: 'Validation Error',
          message: 'Due date is required',
          status: 400
        };
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
        data: {
          todo
        },
        status: 201
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'Failed to create todo',
        status: 500
      };
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
        ctx.body = {
          error: 'Validation Error',
          message: 'Invalid todo ID',
          status: 400
        };
        return;
      }

      const todo = await dbService.getTodoById(todoId);
      if (!todo) {
        ctx.status = 404;
        ctx.body = {
          error: 'Not Found',
          message: 'Todo not found',
          status: 404
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        message: 'Todo retrieved successfully',
        data: {
          todo
        },
        status: 200
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'Failed to retrieve todo',
        status: 500
      };
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
        ctx.body = {
          error: 'User not authenticated',
          message: 'Please log in to access this endpoint',
          status: 401
        };
        return;
      }
      const todoId = parseInt(ctx.params.id);
      if (isNaN(todoId)) {
        ctx.status = 400;
        ctx.body = {
          error: 'Invalid todo ID',
          message: 'Todo ID must be a valid number',
          status: 400
        };
        return;
      }
      const existingTodo = await dbService.getTodoById(todoId);
      if (!existingTodo) {
        ctx.status = 404;
        ctx.body = {
          error: 'Todo not found',
          message: 'The requested todo does not exist',
          status: 404
        };
        return;
      }
      if (existingTodo.creatorId !== ctx.user.id) {
        ctx.status = 403;
        ctx.body = {
          error: 'You can only edit your own todos',
          message: 'Access denied. You can only update todos you created',
          status: 403
        };
        return;
      }
      const updates = ctx.request.body as UpdateTodoRequest;
      if (updates.title !== undefined && updates.title.trim().length === 0) {
        ctx.status = 400;
        ctx.body = {
          error: 'Title cannot be empty',
          message: 'Todo title is required and cannot be empty',
          status: 400
        };
        return;
      }
      const updatedTodo = await dbService.updateTodo(todoId, updates);
      if (!updatedTodo) {
        ctx.status = 404;
        ctx.body = {
          error: 'Todo not found',
          message: 'Todo not found after update attempt',
          status: 404
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        message: 'Todo updated successfully',
        data: updatedTodo,
        status: 200
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the todo',
        status: 500
      };
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
        ctx.body = {
          error: 'User not authenticated',
          message: 'Please log in to access this endpoint',
          status: 401
        };
        return;
      }
      const todoId = parseInt(ctx.params.id);
      if (isNaN(todoId)) {
        ctx.status = 400;
        ctx.body = {
          error: 'Invalid todo ID',
          message: 'Todo ID must be a valid number',
          status: 400
        };
        return;
      }
      const existingTodo = await dbService.getTodoById(todoId);
      if (!existingTodo) {
        ctx.status = 404;
        ctx.body = {
          error: 'Todo not found',
          message: 'The requested todo does not exist',
          status: 404
        };
        return;
      }
      if (existingTodo.creatorId !== ctx.user.id) {
        ctx.status = 403;
        ctx.body = {
          error: 'You can only delete your own todos',
          message: 'Access denied. You can only delete todos you created',
          status: 403
        };
        return;
      }
      const deleted = await dbService.deleteTodo(todoId);
      if (!deleted) {
        ctx.status = 404;
        ctx.body = {
          error: 'Todo not found',
          message: 'Todo not found during deletion',
          status: 404
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        message: 'Todo deleted successfully',
        data: null,
        status: 200
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the todo',
        status: 500
      };
    }
  });

  return router;
};

export const createMyTodosRoutes = (dbService: DatabaseService): Router => {
  const router = new Router();

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
        ctx.body = {
          error: 'User not authenticated',
          message: 'Please log in to access this endpoint',
          status: 401
        };
        return;
      }

      const todos = await dbService.getTodosByUserId(ctx.user.id);
      ctx.status = 200;
      ctx.body = {
        message: 'User todos retrieved successfully',
        data: todos,
        status: 200
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving user todos',
        status: 500
      };
    }
  });

  return router;
}; 