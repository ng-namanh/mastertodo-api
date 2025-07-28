import dotenv from 'dotenv';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import session from 'koa-session';
import { koaSwagger } from 'koa2-swagger-ui';
import { swaggerSpec } from './config/swagger';
import { createAuthMiddleware } from './middleware/auth';
import { createAuthRoutes } from './routes/auth';
import { createMyTodosRoutes, createTodoRoutes } from './routes/todos';
import { createUsersRoutes } from './routes/users';
import { AuthService } from './services/auth';
import { DatabaseService } from './services/database';

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-key';

const dbService = new DatabaseService();
const authService = new AuthService(JWT_SECRET);

app.keys = [SESSION_SECRET];
app.use(session({
  key: 'koa.sess',
  maxAge: 86400000, // 24 hours
}, app));

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || 'Internal server error'
    };
    ctx.app.emit('error', err, ctx);
  }
});

app.use(koaSwagger({
  routePrefix: '/swagger',
  swaggerOptions: {
    spec: swaggerSpec as any,
  },
}));

const authRoutes = createAuthRoutes(authService, dbService);
const todoRoutes = createTodoRoutes(dbService);
const myTodosRoutes = createMyTodosRoutes(dbService);
const usersRoutes = createUsersRoutes(dbService);

const authMiddleware = createAuthMiddleware(authService, dbService);

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

todoRoutes.use(authMiddleware);
myTodosRoutes.use(authMiddleware);
usersRoutes.use(authMiddleware);

app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());
app.use(myTodosRoutes.routes());
app.use(myTodosRoutes.allowedMethods());
app.use(usersRoutes.routes());
app.use(usersRoutes.allowedMethods());

app.use(async (ctx) => {
  if (ctx.path === '/health') {
    ctx.status = 200;
    ctx.body = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Todo API is running'
    };
    return;
  }

  if (ctx.path === '/') {
    ctx.status = 200;
    ctx.body = {
      message: 'Welcome to Todo API',
      version: '1.0.0',
      documentation: {
        swagger: '/swagger',
        health: '/health'
      },
      endpoints: {
        auth: {
          register: 'POST /register',
          login: 'POST /login',
          logout: 'POST /logout'
        },
        todos: {
          getAll: 'GET /todos (with filters: ?status=PENDING,IN_PROGRESS&assignedTo=1,2&starred=true&priority=HIGH,MEDIUM)',
          getMyTodos: 'GET /my-todos',
          getById: 'GET /todos/:id',
          create: 'POST /todos',
          update: 'PUT /todos/:id',
          delete: 'DELETE /todos/:id'
        },
        users: {
          getAll: 'GET /users'
        }
      }
    };
    return;
  }

  if (ctx.path === '/swagger.json') {
    ctx.status = 200;
    ctx.body = swaggerSpec;
    return;
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/`);
  console.log(`🔍 Swagger UI: http://localhost:${PORT}/swagger`);
  console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/swagger.json`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await dbService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await dbService.close();
  process.exit(0);
}); 