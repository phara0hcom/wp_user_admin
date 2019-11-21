const { gql } = require('apollo-server-express');
// the different data objects that can be sen and returned
// in queries and for mutations
const schema = gql`
  scalar Date

  type Query {
    listUsers(max: Int!, nextPageToken: String): multipleUsersResponse
    getUser(uid: ID!): userResponse
    queryUserDb(column: String, compare: String!, value: String!): multipleUsersResponse
    authToken(token: ID!): userResponse
    loginUser(email: String!, password: String!): userResponse
    sendReset(email: String!): successRes
  }

  type Mutation {
    addUser(user: NewUser!): userResponse
    editUser(uid: ID!, data: EditUserInput!): userResponse
    resetPassword(id: ID!): userResponse
    sendSms(uid: ID!): userResponse
    deleteUser(uid: ID!): successRes
  }

  type multipleUsersResponse {
    success: Boolean!
    message: String
    users: [User]
  }

  type userResponse {
    success: Boolean!
    message: String
    user: User
  }

  type successRes {
    success: Boolean!
    message: String
  }

  type User {
    uid: ID!
    email: String!
    phoneNumber: String
    displayName: String
    type: String!
  }

  input EditUserInput {
    email: String
    password: String
    phoneNumber: String
    smsSend: Boolean
    smsLastSend: Date
    type: String
    displayName: String
  }

  input NewUser {
    email: String!
    password: String!
    type: String
    displayName: String
    phoneNumber: String
  }
`;

export default schema;
