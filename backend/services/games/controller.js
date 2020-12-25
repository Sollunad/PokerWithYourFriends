const {newGame} = require("./gameBuilder");
const {Connector} = require("../../db/connector");

exports.createNewGame = createNewGame;

async function createNewGame(creator_sub) {
    const game = newGame(creator_sub);
    const code = game.code;

    const connector = new Connector();
    await connector.connect();
    const collection = connector.games();

    try {
        await collection.insertOne(game);
        return {db_status: 'success', game_code: code};
    } catch (err) {
        return {db_status: 'error', message: err};
    }
}