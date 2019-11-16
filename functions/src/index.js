import { https } from 'firebase-functions';
import gqlServer from './graphQL/';

const server = gqlServer();

// Graphql api
// https://us-central1-<project-name>.cloudfunctions.net/api/
const api = https.onRequest(server);

export { api };
