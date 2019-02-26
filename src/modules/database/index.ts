import { Database as ArangoDB } from 'arangojs';

const url = process.env.ARANGO_URL;
const username = process.env.ARANGO_USER;
const password = process.env.ARANGO_PASSWORD;
const dbname = process.env.ARANGO_DB;

const database = new ArangoDB({
    url
});

database.useDatabase(dbname || '');
database.useBasicAuth(username, password);

export const Database = database;