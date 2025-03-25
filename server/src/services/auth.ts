import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Define a type for decoded token
interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Middleware function for authentication with GraphQL
export const authMiddleware = ({ req }: { req: Request }) => {
  // Allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

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
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const { _id, username, email } = jwt.verify(token, secretKey) as JwtPayload;
    
    // Add user data to request object
    (req as any).user = { _id, username, email };
  } catch {
    console.log('Invalid token');
  }

  // Return updated request object
  return req;
};

// Function to generate JWT token
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Keep the original middleware for REST endpoints if needed
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};