import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify that JWT_SECRET_KEY is set
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  console.error('JWT_SECRET_KEY is not set in environment variables');
  // Don't throw error here to allow server to start, but authentication will fail
}

// Define a type for decoded token
export interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Interface for authenticated request
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware function for authentication with GraphQL
export const authMiddleware = ({ req }: { req: Request }) => {
  // Allows token to be sent via req.body, req.query, or headers
  let token = req.body?.token || req.query?.token || req.headers.authorization;

  // ["Bearer", "<tokenvalue>"]
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  // If no token, return request object as is
  if (!token) {
    return req;
  }

  try {
    // Verify token and get user data out of it
    if (!JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is not configured');
    const { _id, username, email } = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
    
    // Add user data to request object
    (req as any).user = { _id, username, email };
  } catch (err) {
    console.log('Invalid token', err);
  }

  // Return updated request object
  return req;
};

// Function to generate JWT token
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  
  if (!JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not configured');
  }

  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' });
};

// Keep the original middleware for REST endpoints if needed
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    if (!JWT_SECRET_KEY) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
      if (err) {
        res.sendStatus(403); // Forbidden
        return;
      }

      req.user = user as JwtPayload;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};