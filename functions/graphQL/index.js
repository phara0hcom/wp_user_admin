"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _express = _interopRequireDefault(require("express"));
var _apolloServerExpress = require("apollo-server-express");

var _schema = _interopRequireDefault(require("./schema"));
var _resolvers = _interopRequireDefault(require("./resolvers"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function gqlServer() {
  const app = (0, _express.default)();

  const apolloServer = new _apolloServerExpress.ApolloServer({
    typeDefs: _schema.default,
    resolvers: _resolvers.default,
    // Enable graphQL gui
    introspection: true,
    playground: true });


  apolloServer.applyMiddleware({ app, path: '/', cors: true });

  return app;
}var _default =

gqlServer;exports.default = _default;