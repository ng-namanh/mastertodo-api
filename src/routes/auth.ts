import Router from 'koa-router';
import { AuthService } from '../services/auth';
import { DatabaseService } from '../services/database';
import { CreateUserRequest, LoginRequest } from '../types';

export const createAuthRoutes = (authService: AuthService, dbService: DatabaseService): Router => {
  const router = new Router();

  /**
   * @swagger
   * /register:
   *   post:
   *     summary: Register a new guys
   *     description: Create a new user account with username, email, and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Conflict - user already exists
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
  router.post('/register', async (ctx) => {
    try {
      const { username, email, password }: CreateUserRequest = ctx.request.body as CreateUserRequest;

      // Validate input
      if (!username || !email || !password) {
        ctx.status = 400;
        ctx.body = { error: 'Username, email, and password are required' };
        return;
      }

      if (password.length < 6) {
        ctx.status = 400;
        ctx.body = { error: 'Password must be at least 6 characters long' };
        return;
      }

      // Check if user already exists
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        ctx.status = 409;
        ctx.body = { error: 'User with this email already exists' };
        return;
      }

      // Hash password and create user
      const hashedPassword = await authService.hashPassword(password);
      const user = await dbService.createUser({
        username,
        email,
        password: hashedPassword
      });

      // Generate token
      const token = authService.generateToken(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      ctx.status = 201;
      ctx.body = {
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  /**
   * @swagger
   * /login:
   *   post:
   *     summary: Login user
   *     description: Authenticate user with email and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - invalid credentials
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
  router.post('/login', async (ctx) => {
    try {
      const { email, password }: LoginRequest = ctx.request.body as LoginRequest;

      // Validate input
      if (!email || !password) {
        ctx.status = 400;
        ctx.body = { error: 'Email and password are required' };
        return;
      }

      // Find user by email
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid email or password' };
        return;
      }

      // Verify password
      const isValidPassword = await authService.comparePassword(password, user.password);
      if (!isValidPassword) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid email or password' };
        return;
      }

      // Generate token
      const token = authService.generateToken(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      ctx.status = 200;
      ctx.body = {
        message: 'Login successful',
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  /**
   * @swagger
   * /logout:
   *   post:
   *     summary: Logout user
   *     description: Logout user (client-side token removal)
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Logout successful"
   */
  router.post('/logout', async (ctx) => {
    ctx.status = 200;
    ctx.body = { message: 'Logout successful' };
  });

  return router;
}; 