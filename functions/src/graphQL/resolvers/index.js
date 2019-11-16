import admin from 'firebase-admin';

admin.initializeApp();

const userCollection = admin.firestore().collection('users');

const resolverFunctions = {
  Query: {
    users: () =>
      userCollection
        .get()
        .then(data => {
          const users = [];
          data.forEach(doc => {
            const data = doc.data();
            users.push({
              ...data,
              id: doc.id,
              createdOn: data.createdOn.toDate()
            });
          });
          return {
            success: true,
            users
          };
        })
        .catch(err => ({
          success: false,
          message: `${err}`
        })),

    getUser: (root, args) => {
      return (
        admin
          .auth()
          .getUser(args.id)
          //TODO the data parsing is wrong
          .then(doc => ({ success: true, user: { ...doc.data(), id: doc.id } }))
          .catch(err => ({
            success: false,
            message: `${err}`
          }))
      );
    }
  },
  Mutation: {
    addUser: (root, args) => {
      const user = { ...args.user };
      return admin
        .auth()
        .createUser({
          ...user
        })
        .then(res => {
          return userCollection
            .add(user)
            .then(doc => ({
              success: true,
              users: { ...user, id: doc.id }
            }))
            .catch(err => ({
              success: false,
              message: `${err}`
            }));
        });
    },

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
