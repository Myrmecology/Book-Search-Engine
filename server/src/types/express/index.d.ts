import { JwtPayload } from '../../services/auth.js';

declare namespace Express {
  interface Request {
    user?: {
      _id: unknown;
      username: string;
      email: string;
    };
  }
}

// Define User interface for GraphQL context
export interface User {
  _id: unknown;
  username: string;
  email: string;
}

// Define Context interface for Apollo Server
export interface Context {
  user?: User;
}

// Extended Request interface with user property
export interface AuthRequest extends Express.Request {
  user?: User;
  params: any;
  body: any;
}