import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';

function gqlServer() {
  const app = express();

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    // Enable graphQL gui
    introspection: true,
    playground: true
  });

  apolloServer.applyMiddleware({ app, path: '/api', cors: true });

  return app;
}

export default gqlServer;
