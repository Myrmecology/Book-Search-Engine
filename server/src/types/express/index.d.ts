declare namespace Express {
  interface Request {
    user: {
      _id: unknown;
      username: string;
      email?: string;
    };
  }
}

// Add these new interfaces for GraphQL context
export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface Context {
  user?: User;
}

export interface AuthRequest extends Express.Request {
  user?: User;
}