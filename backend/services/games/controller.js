const {newGame, newPlayer} = require("./gameBuilder");
const {Connector} = require("../../db/connector");

exports.createNewGame = createNewGame;
exports.joinGame = joinGame;

async function createNewGame(creator_sub) {
    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    // Spam-Schutz, überprüfe, ob der Nutzer schon ein offenes Game hat
    const query = {
        admin: creator_sub,
    };
    const gamesForAdmin = await games.find(query).toArray();
    if (gamesForAdmin.length) return {db_status: 'success', game_code: gamesForAdmin[0].code};

    // Erstelle neues Game
    const game = newGame(creator_sub);
    const code = game.code;

    try {
        await games.insertOne(game);
        return {db_status: 'success', game_code: code};
    } catch (err) {
        return {db_status: 'error', error: 'Es ist ein Fehler aufgetreten'};
    }
}

async function joinGame(user_sub, game_code) {
    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    // Prüfe, ob es ein Game gibt für den Game-Code, das noch nicht gestartet ist und dem der Nutzer nicht beigetreten ist
    const query = {
        code: game_code,
        started: false,
        'players.user_id': { $ne: user_sub }
    };
    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return;

    // Füge Nutzer dem Spiel hinzu
    const newP = newPlayer(user_sub);
    const updateQuery = {
        $push: { players: newP },
    };
    await games.updateOne(query, updateQuery);
}