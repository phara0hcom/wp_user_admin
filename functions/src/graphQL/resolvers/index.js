import admin from 'firebase-admin';
import { badEnumValueMessage } from 'graphql/validation/rules/ValuesOfCorrectType';

admin.initializeApp();

const getUserData = uid =>
  admin
    .auth()
    .getUser(args.id)
    //TODO: the data parsing is wrong
    .then(userRec => {
      authUser = userRec;
      return userCollection.where('uid', '==', userRec.uid).get();
    })
    .then(userDb => {
      let dbUser;
      userDb.forEach(doc => {
        const dataDoc = doc.data();
        if (dataDoc.uid === authUser.uid) dbUser = dataDoc;
      });
      return {
        success: true,
        user: { ...authUser, ...dbUser }
      };
    })
    .catch(err => ({
      success: false,
      message: `${err}`
    }));

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
      return (
        admin
          .auth()
          .getUser(args.id)
          //TODO: the data parsing is wrong
          .then(userRec => {
            authUser = userRec;
            return userCollection.where('uid', '==', userRec.uid).get();
          })
          .then(userDb => {
            let dbUser;
            userDb.forEach(doc => {
              const dataDoc = doc.data();
              if (dataDoc.uid === authUser.uid) dbUser = dataDoc;
            });
            return {
              success: true,
              user: { ...authUser, ...dbUser }
            };
          })
          .catch(err => ({
            success: false,
            message: `${err}`
          }))
      );
    },
    // each user will get a token on login here we can look up the token and return the user object
    authToken: (root, args) =>
      admin
        .auth()
        .verifyIdToken(args.token)
        .then(decodedToken => {
          console.log('decodedToken', decodedToken);
          const uid = decodedToken.uid;
          return admin.auth().getUser(uid);
        })
        .then(authUser => {
          console.log('authUser', authUser);
          return {
            success: true,
            user: { ...userRec, ...authUser, id: doc.id }
          };
        })
        .catch(err => ({
          success: false,
          message: `${err}`
        }))
  },
  Mutation: {
    // To add a user you can do a mutation call and send the user object that will be saved in the auth database and also in the user database with the UID of the auth database
    addUser: (root, args) => {
      const user = { ...args.user };
      let type = user.type;
      if(type !== 'user'|| type !== 'admin') type = 'user'
      return admin
        .auth()
        .createUser({
          ...user
        })
        .then(authDoc => {
          return userCollection.add({ ...user, uid: authDoc.id, type });
        })
        .then(doc => ({
          success: true,
          users: { ...user, id: doc.id }
        }))
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    },
    // edit user depending on the field in both auth database and in the user database
    editUser: (root, args) => {
      return userCollection
        .doc(args.id)
        .set({ ...args.data }, { merge: true })
        .then(doc => ({
          success: true,
          users: { ...user, id: doc.id }
        }))
        .catch(err => ({
          success: false,
          message: `${err}`
        }));
    }
  }
};

export default resolverFunctions;
