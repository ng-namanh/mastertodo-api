import Router from 'koa-router';
import { DatabaseService } from '../services/database';
import { AuthContext, CreateTodoRequest, UpdateTodoRequest } from '../types';

export const createTodoRoutes = (dbService: DatabaseService): Router => {
  const router = new Router({ prefix: '/todos' });

  router.get('/', async (ctx: AuthContext) => {
    try {
      console.log('ctx.user', ctx.user);

      const filters: any = {};

      if (ctx.query.status) {
        const statusArray = typeof ctx.query.status === 'string'
          ? ctx.query.status.split(',').map(s => s.trim())
          : ctx.query.status;
        filters.status = statusArray;
      }

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

      if (ctx.query.starred !== undefined) {
        filters.starred = ctx.query.starred === 'true';
      }

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
          filters: filters
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