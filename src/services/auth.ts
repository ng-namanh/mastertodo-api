import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload, User } from '../types';

export class AuthService {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };

  comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };

  generateToken = (user: User): string => {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  };

  verifyToken = (token: string): JwtPayload | null => {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      return null;
    }
  };

  extractTokenFromHeader = (authHeader: string): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  };
} 