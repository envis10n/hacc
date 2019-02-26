import { Database as ArangoDB } from 'arangojs';

const url = process.env.ARANGO_URL || "http://localhost:8529";
const username = process.env.ARANGO_USER;
const password = process.env.ARANGO_PASSWORD;
const dbname = process.env.ARANGO_DB;

const Database = new ArangoDB({
    url
});

Database.useDatabase(dbname || '');
Database.useBasicAuth(username, password);

export default Database;