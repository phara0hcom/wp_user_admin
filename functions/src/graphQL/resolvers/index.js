import admin from 'firebase-admin';

admin.initializeApp();

const userCollection = admin.firestore().collection('users');
//resolver function for graphQL that looks up the request in the different databases
//it will return an object in the way described in the /schema folder
const resolverFunctions = {
  Query: {
    /**
     * the user query will return the full user list with in an array of user
     */
    listUsers: (root, args) =>
      admin
        .auth()
        .listUsers(args.max, nextPageToken)
        .then(data => {
          console.log('listUsers', data);
          // const users = [];
          // data.forEach(doc => {
          //   const data = doc.data();
          //   users.push({
          //     ...data,
          //     id: doc.id,
          //     createdOn: data.createdOn.toDate()
          //   });
          // });
          return {
            success: true,
            users: data
          };
        })
        .catch(err => ({
          success: false,
          message: `${err}`
        })),
    // get a single user out of the auth database and in the user database the date will be merged and send back
    getUser: (root, args) => {
      return (
        admin
          .auth()
          .getUser(args.id)
          //TODO: the data parsing is wrong
          .then(userRec => userCollection.where('uid', '==', userRec.uid))
          .then(doc => ({
            success: true,
            user: { ...userRec, ...doc.data(), id: doc.id }
          }))
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
        .verifyIdToken(idToken)
        .then(decodedToken => {
          const uid = decodedToken.uid;
          return admin.auth().getUser(uid);
        })
        .then(doc => ({
          success: true,
          user: { ...userRec, ...doc.data(), id: doc.id }
        }))
        .catch(err => ({
          success: false,
          message: `${err}`
        }))
  },
  Mutation: {
    // To add a user you can do a mutation call and send the user object that will be saved in the auth database and also in the user database with the UID of the auth database
    addUser: (root, args) => {
      const user = { ...args.user };
      return admin
        .auth()
        .createUser({
          ...user
        })
        .then(authDoc => {
          return userCollection.add({ ...user, uid: authDoc.id });
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
