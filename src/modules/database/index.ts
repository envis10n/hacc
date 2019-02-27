import { Database as ArangoDB, EdgeCollection, DocumentCollection } from 'arangojs';

const url = process.env.ARANGO_URL || "http://localhost:8529";
const username = process.env.ARANGO_USER || '';
const password = process.env.ARANGO_PASSWORD || '';
const dbname = process.env.ARANGO_DB || '';
const collections: string[] = JSON.parse(process.env.ARANGO_COLLECTIONS || "[]");

declare type ArangoCollection = EdgeCollection | DocumentCollection;

declare interface ArangoSetup {
    url: string;
    username: string;
    password: string;
    name: string;
    collections: string[];
}

export class Database {
    private collections: Map<string, ArangoCollection> = new Map();
    private database: ArangoDB;
    public dbname: string;
    constructor(options: ArangoSetup) {
        this.dbname = options.name;
        this.database = new ArangoDB({
            url: options.url
        });
        this.database.useDatabase(options.name);
        this.database.useBasicAuth(options.username, options.password);
        for(let cname of options.collections) {
            let collection = this.database.collection(cname);
            collection.exists().then((exists) => {
                if(exists === false) {
                    collection.create().then(() => {
                        console.log(`Created collection ${cname}.`);
                        this.collections.set(cname, collection);
                    }).catch((e) => {
                        console.error(e);
                    });
                } else {
                    this.collections.set(cname, collection);
                }
            }).catch((e) => {
                console.error(e);
            });
        }
    }
    collection(name: string): ArangoCollection {
        let collection = this.collections.get(name);
        if(collection !== undefined) return collection;
        // Collection does not exist in our cache. Grab it from the DB.
        else collection = this.database.collection(name);
        // Won't let me use collection inside of the promise handler later?
        let col: ArangoCollection = collection;
        // Ensure that the collection exists. This is async, and we are not using an async function.
        // This will run in the background, while the collection is returned anyway.
        collection.exists().then((exists) => {
            if(exists === false){
                col.create().then(() => {
                    // Cache the collection for use later.
                    this.collections.set(name, col);
                    console.log(`Created collection ${name}.`);
                }).catch((e) => {
                    console.error(e);
                });
            }
        }).catch((e) => {
            console.error(e);
        });
        return collection;
    }
}

const DB = new Database({
    url,
    username,
    password,
    collections,
    name: dbname
});

export default DB;