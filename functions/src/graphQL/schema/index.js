const { gql } = require('apollo-server-express');
// the different data objects that can be sen and returned
// in queries and for mutations
const schema = gql`
  scalar Date

  type Query {
    listUsers: multipleUsersResponse
    getUser(id: ID!): userResponse
    authToken(token: ID!): userResponse
  }

  type Mutation {
    addUser(user: NewUser!): userResponse
    editUser(id: ID!, data: EditUserInput!): userResponse
    resetPassword(id: ID!): userResponse
    sendSms(id: ID!): userResponse
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

  type User {
    id: ID!
    createdOn: Date!
    email: String
    password: String!
    smsSend: Boolean
    smsLastSend: Date
    type: String!
    displayName: String!
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
