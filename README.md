# API back-end hosted in firebase

API endPoint:
`https://us-central1-wealthpark-te-test.cloudfunctions.net/api`

##graphQL
I've chosen graphQL because I've worked with it in the past and like it's flexibility to have different sources of data in and merge them in one and point. Also thought it would be the fastest for me to set up.

##Firebase
for similar reasons but I've never used it for nodeJS back-end code and will not use it in the future or advice anyone to use it because it is on node 8 and node 10 is a beta.

##Data Auth
```
  email: String,
  emailVerified: Boolean,
  phoneNumber: String,
  password: String,
  displayName: String,
  photoURL: String,
  disabled: Boolean
```

#Data Users
```
  UID: String, //the UID from the Auth DB
  smsSend: Boolean,
  lastSendSMS: Number,
  type: String
```

##graphQL Query calls

###`users: multipleUsersResponse`
`multipleUsersResponse` response:
```
{
  success: Boolean!
  message: String
  users: [User]
}
```

###`authToken(token: ID!): userResponse`
###`getUser(id: ID!): userResponse`
`userResponse` Response:
```
{
  success: Boolean!
  message: String
  user: User
}
```
authToken(token: ID!): userResponse