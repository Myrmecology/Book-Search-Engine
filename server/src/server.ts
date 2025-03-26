import express from 'express';
import path from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';

// Port configuration
const PORT = process.env.PORT || 3001;

// Create Express application
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// If in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Function to start Apollo Server
async function startApolloServer() {
  // Create HTTP server
  const httpServer = http.createServer(app);
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware, // Apply auth middleware to context
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();
  
  // Apply middleware to Express
  server.applyMiddleware({ app: app as any });

  // Serve React app for any route not defined (client-side routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  // Start the server once database connection is open
  db.once('open', () => {
    httpServer.listen(PORT, () => {
      console.log(`🌍 API server running on port ${PORT}!`);
      console.log(`🚀 Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

// Start the server
startApolloServer();