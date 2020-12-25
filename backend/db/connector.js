const {MongoClient} = require("mongodb");
const config = require('./config.json');

exports.Connector = class Connector {
    constructor() {
        const uri = `mongodb+srv://${config.user}:${config.password}@${config.url}/${config.database}?retryWrites=true&w=majority`;
        this.client = new MongoClient(uri);
    }

    async connect() {
        await this.client.connect();
    }

    games() {
        return this.client.db('testDatabase').collection('games');
    }

    async close() {
        await this.client.close();
    }
};