"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;const { gql } = require('apollo-server-express');

const schema = gql`
  scalar Date

  type Query {
    users: usersResponse
    getUser(id: ID!): userResponse
  }

  type Mutation {
    addUser(user: UserInput!): userResponse
    editUser(id: ID!): userResponse
    resetPassword(id: ID!): userResponse
    sendSms(id: ID!): userResponse
  }

  type usersResponse {
    success: Boolean!
    message: String
    users: [User]
  }

  type userResponse {
    success: Boolean!
    message: String
    user: User
  }

  type User {
    id: ID!
    createdOn: Date!
    email: String
    password: String!
    phoneNumber: String
    smsSend: Boolean
    smsLastSend: Date
    type: String!
    userName: String!
  }

  input UserInput {
    email: String
    password: String
    phoneNumber: String!
    type: String!
    userName: String!
  }
`;var _default =

schema;exports.default = _default;