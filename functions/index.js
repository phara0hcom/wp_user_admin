"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.api = void 0;var _firebaseFunctions = require("firebase-functions");
var _graphQL = _interopRequireDefault(require("./graphQL/"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const server = (0, _graphQL.default)();

// Graphql api
// https://us-central1-<project-name>.cloudfunctions.net/api/
const api = _firebaseFunctions.https.onRequest(server);exports.api = api;