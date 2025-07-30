import Router from 'koa-router';
import { AuthService } from '../services/auth';
import { DatabaseService } from '../services/database';
import { CreateUserRequest, LoginRequest } from '../types';

export const createAuthRoutes = (authService: AuthService, dbService: DatabaseService): Router => {
  const router = new Router();

  router.post('/register', async (ctx) => {
    try {
      const { username, email, password }: CreateUserRequest = ctx.request.body as CreateUserRequest;

      // Validate input
      if (!username || !email || !password) {
        ctx.status = 400;
        ctx.body = {
          error: 'Username, email, and password are required',
          message: 'Please provide all required fields',
          status: 400
        };
        return;
      }

      if (password.length < 6) {
        ctx.status = 400;
        ctx.body = {
          error: 'Password must be at least 6 characters long',
          message: 'Password validation failed',
          status: 400
        };
        return;
      }

      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        ctx.status = 409;
        ctx.body = {
          error: 'User with this email already exists',
          message: 'Registration failed - email already in use',
          status: 409
        };
        return;
      }

      const hashedPassword = await authService.hashPassword(password);
      const user = await dbService.createUser({
        username,
        email,
        password: hashedPassword
      });

      const token = authService.generateToken(user);

      const { password: _, ...userWithoutPassword } = user;

      ctx.status = 201;
      ctx.body = {
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token
        },
        status: 201
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'An unexpected error occurred during registration',
        status: 500
      };
    }
  });

  router.post('/login', async (ctx) => {
    try {
      const { email, password }: LoginRequest = ctx.request.body as LoginRequest;

      if (!email || !password) {
        ctx.status = 400;
        ctx.body = {
          error: 'Email and password are required',
          message: 'Please provide both email and password',
          status: 400
        };
        return;
      }

      const user = await dbService.getUserByEmail(email);
      if (!user) {
        ctx.status = 401;
        ctx.body = {
          error: 'Invalid email or password',
          message: 'Login failed - please check your credentials',
          status: 401
        };
        return;
      }

      const isValidPassword = await authService.comparePassword(password, user.password);
      if (!isValidPassword) {
        ctx.status = 401;
        ctx.body = {
          error: 'Invalid email or password',
          message: 'Login failed - please check your credentials',
          status: 401
        };
        return;
      }

      const token = authService.generateToken(user);

      const { password: _, ...userWithoutPassword } = user;

      ctx.status = 200;
      ctx.body = {
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        },
        status: 200
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        message: 'An unexpected error occurred during login',
        status: 500
      };
    }
  });

  router.post('/logout', async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      message: 'Logout successful',
      data: null,
      status: 200
    };
  });

  return router;
}; 