// Import WebSocket namespace.
import { WebSocket } from './modules/network';
// Import Database, caching the module and connecting to the database.
// This can then be imported anywhere else in the project to get access the DB.
import Database from './modules/database';

let wss = new WebSocket.Server({port: 13378});

wss.on('listening', (port) => {
    console.log(`WebSocket listening on port ${port}`);
});