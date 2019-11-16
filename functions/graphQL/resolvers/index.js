"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _firebaseAdmin = _interopRequireDefault(require("firebase-admin"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(source, true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(source).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

_firebaseAdmin.default.initializeApp();

const userCollection = _firebaseAdmin.default.firestore().collection('users');

const resolverFunctions = {
  Query: {
    users: () =>
    userCollection.
    get().
    then(data => {
      const users = [];
      data.forEach(doc => {
        const data = doc.data();
        users.push(_objectSpread({},
        data, {
          id: doc.id }));

      });
      return {
        success: true,
        users };

    }).
    catch(err => ({
      success: false,
      message: `${err}` })),


    getUser: (root, args) => {
      return userCollection.
      doc(args.id).
      get().
      then(doc => ({ success: true, user: _objectSpread({}, doc.data(), { id: doc.id }) })).
      catch(err => ({
        success: false,
        message: `${err}` }));

    } },

  Mutation: {
    addUser: (root, args) => {
      const user = _objectSpread({}, args.user);
      return userCollection.
      add(user).
      then(doc => ({
        success: true,
        users: _objectSpread({}, user, { id: doc.id }) })).

      catch(err => ({
        success: false,
        message: `${err}` }));

    } } };var _default =



resolverFunctions;exports.default = _default;