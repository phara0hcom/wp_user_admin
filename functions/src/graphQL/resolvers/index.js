import admin from 'firebase-admin';
import { badEnumValueMessage } from 'graphql/validation/rules/ValuesOfCorrectType';

admin.initializeApp();

const getAuthUser = uid => admin.auth().getUser(uid);

const queryUserCollection = (column, compare, value) =>
  userCollection.where(column, compare, value).get();

const getUserData = uid => {
  let user;
  return (
    getAuthUser(uid)
      //TODO: the data parsing is wrong
      .then(userRec => {
        user = userRec;
        return queryUserCollection('uid', '==', userRec.uid);
      })
      .then(userDb => {
        let dbUser;
        userDb.forEach(doc => {
          const dataDoc = doc.data();
          if (dataDoc.uid === user.uid) dbUser = dataDoc;
        });
        return {
          success: true,
          user: { ...user, ...dbUser }
        };
      })
      .catch(err => ({
        success: false,
        message: `${err}`
      }))
  );
};

const userCollection = admin.firestore().collection('users');
//resolver function for graphQL that looks up the request in the different databases
//it will return an object in the way described in the /schema folder
const resolverFunctions = {
  Query: {
    /**
     * the user query will return the full user list with in an array of user
     */
    listUsers: (root, args) => {
      const authUsers = {};
      return admin
        .auth()
        .listUsers(args.max, args.nextPageToken)
        .then(userList => {
          userList.users.forEach(listUser => {
            authUsers[listUser.uid] = {
              ...listUser,
              displayName: listUser.displayName || '',
              phoneNumber: listUser.phoneNumber || ''
            };
          });
          return authUsers;
        })
        .then(() => userCollection.get())
        .then(userDb => {
          const returnUsers = [];
          userDb.forEach(doc => {
            const docData = doc.data();
            if (typeof authUsers[docData.uid] === 'object') {
              returnUsers.push({
                ...docData,
                ...authUsers[docData.uid]
              });
            }
          });

          return {
            success: true,
            users: returnUsers
          };
        })
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    },
    // get a single user out of the auth database and in the user database the date will be merged and send back
    getUser: (root, args) => {
      let authUser;
      return getUserData(args.uid);
    },
    // each user will get a token on login here we can look up the token and return the user object
    authToken: (root, args) => {
      return admin
        .auth()
        .verifyIdToken(args.token)
        .then(decodedToken => {
          const uid = decodedToken.uid;
          return getUserData(uid);
        });
    },
    sendReset: (root, args) =>
      admin
        .auth()
        .generatePasswordResetLink(args.email)
        .then(link => {
          return { success: true, message: `${link}` };
        })
        .catch(err => ({ success: false, message: `${err}` })),

    queryUserDb: (root, { column, compare, value }) =>
      queryUserCollection(column, compare, value)
        .then(snapshot => {
          if (snapshot.empty) {
            return {
              success: true,
              message: 'empty',
              users: []
            };
          }
          const users = [];
          snapshot.forEach(doc => {
            users.push({ ...doc.data() });
          });

          return {
            success: true,
            users
          };
        })
        .catch(err => ({
          success: true,
          message: `${err}`
        }))
  },
  Mutation: {
    // To add a user you can do a mutation call and send the user object that will be saved in the auth database and also in the user database with the UID of the auth database
    addUser: (root, args) => {
      const user = { ...args.user };
      const { phoneNumber } = args.user;
      if (!phoneNumber || phoneNumber.length < 1) {
        delete user.phoneNumber;
      }
      let type = user.type;
      if (type !== 'user' || type !== 'admin') type = 'user';
      return admin
        .auth()
        .createUser({
          ...user
        })
        .then(authDoc => {
          user.uid = authDoc.uid;
          user.password = 'No password';
          return userCollection.add({ ...user, uid: authDoc.uid, type });
        })
        .then(() => {
          return {
            success: true,
            user: { ...user }
          };
        })
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    },
    // edit user depending on the field in both auth database and in the user database
    editUser: (root, args) => {
      const user = { ...args.data };
      return admin
        .auth()
        .updateUser(args.uid, { ...user })
        .then(() => {
          return queryUserCollection('uid', '==', args.uid);
        })
        .then(searchDocs => {
          if (searchDocs.empty) {
            return {
              success: false,
              message: 'user not found in user db'
            };
          }
          let id;
          searchDocs.forEach(doc => {
            const data = doc.data();
            if (data.uid === args.uid) {
              id = doc.id;
            }
          });
          user.uid = args.uid;
          user.password = '';
          return userCollection.doc(id).set({ ...user }, { merge: true });
        })
        .then(() => {
          return {
            success: true,
            user: { ...user }
          };
        })
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    },
    deleteUser: (root, args) => {
      return admin
        .auth()
        .deleteUser(args.uid)
        .then(() => ({
          success: true
        }))
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    },
    signUp: (root, args) => {
      const { id, email, password } = args;
      return userCollection
        .doc(id)
        .get()
        .then(doc => {
          console.log({ doc });
          if (!doc.exists) {
            return {
              success: false,
              message: `the Id is not found`
            };
          } else {
            const data = doc.data();
            console.log({ data });
            if (data.uid) {
              return {
                success: false,
                message: `the Id has a account`
              };
            } else {
              return admin.auth().createUser({
                email,
                password
              });
            }
          }
        })
        .then(authDoc => {
          const uid = authDoc.uid;
          return userCollection.doc(id).set({ uid, email }, { merge: true });
        })
        .then(() => ({
          success: true,
          message: `Account made`
        }))
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    },
    sendSms: (root, args) => {
      const { phoneNumber } = args;
      return userCollection
        .add({ type: 'user', phoneNumber })
        .then(doc => ({
          success: true,
          id: doc.id
        }))
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    }
  }
};

export default resolverFunctions;
