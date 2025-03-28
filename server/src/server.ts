import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Port configuration
const PORT = process.env.PORT || 3001;

// Create Express application
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Test route to check if server is working
app.get('/api/test', (_req, res) => {
  res.json({ message: 'API is working!' });
});

async function startApolloServer() {
  // Create a new instance of Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    cache: 'bounded', // Add bounded cache to prevent DOS warning
  });

  // Start the Apollo Server
  await server.start();
  
  // Apply the Apollo GraphQL middleware and set the path to /graphql
  server.applyMiddleware({ 
    app: app as any, 
    path: '/graphql' 
  });
  
  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/build')));
  }
  
  // Wildcard route to serve React app
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
  
  // Connect to the database and start the server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 API server running on port ${PORT}!`);
      console.log(`🚀 Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

// Call the async function to start the server
startApolloServer();