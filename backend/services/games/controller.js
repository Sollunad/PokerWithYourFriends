const {newGame, newPlayer} = require("./gameBuilder");
const {Connector} = require("../../db/connector");

exports.createNewGame = createNewGame;
exports.joinGame = joinGame;
exports.getGame = getGame;
exports.getAdminGame = getAdminGame;
exports.startGame = startGame;
exports.adjustBlinds = adjustBlinds;
exports.setRoundCounter = setRoundCounter;
exports.setNextDealer = setNextDealer;
exports.updateChipsForPlayer = updateChipsForPlayer;
exports.updateChipsForUsername = updateChipsForUsername;
exports.setUsername = setUsername;
exports.deleteGame = deleteGame;

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

    // Prüfe, ob es ein Game gibt, das joinable ist
    const query = {
        code: game_code,
        started: false,
        'players.user_id': { $ne: user_sub },
        player_count: { $lte: 8 },
    };
    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return;
    const newPlayerCount = gameForCode[0].player_count + 1;

    // Füge Nutzer dem Spiel hinzu
    const newP = newPlayer(user_sub);
    const updateQuery = {
        $set: { player_count: newPlayerCount },
        $push: { players: newP },
    };
    await games.updateOne(query, updateQuery);
}

async function getGame(game_code) {
    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return;
    return gameForCode[0];
}

async function getAdminGame(game_code, user_sub) {
    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: user_sub,
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return;
    return gameForCode[0];
}

async function startGame(game_code, user_sub) {
    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: user_sub,
    };

    const updateQuery = {
        $set: {
            started: true,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function adjustBlinds(game_code, user_sub, blinds) {
    if (!blinds) return;

    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: user_sub,
    };

    const updateQuery = {
        $set: {
            blind_rules: blinds,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function setRoundCounter(game_code, admin_sub, rounds_played) {
    if (!rounds_played) return;

    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: admin_sub,
    };

    const updateQuery = {
        $set: {
            rounds_played,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function setNextDealer(game_code, admin_sub, next_dealer) {
    if (!next_dealer && next_dealer !== 0) return;

    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: admin_sub,
    };

    const updateQuery = {
        $set: {
            next_dealer,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function updateChipsForPlayer(game_code, admin_sub, player_sub, chips) {
    if (!chips && chips !== 0) return;

    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: admin_sub,
        players: { $elemMatch: { user_id: player_sub } }
    };

    const updateQuery = {
        $set: {
            'players.$.chips': chips,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function updateChipsForUsername(game_code, admin_sub, user_name, chips) {
    if (!chips) return;

    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: admin_sub,
        players: { $elemMatch: { name: user_name } }
    };

    const updateQuery = {
        $set: {
            'players.$.chips': chips,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function setUsername(game_code, user_sub, name) {
    if (!name) return;

    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        players: { $elemMatch: { user_id: user_sub } }
    };

    const updateQuery = {
        $set: {
            'players.$.name': name,
        }
    };

    const gameForCode = await games.find(query).toArray();
    if (!gameForCode.length) return {db_status: 'error', error: 'Game not found'};
    await games.updateOne(query, updateQuery);
    return {db_status: 'success'};
}

async function deleteGame(game_code, admin_sub) {
    const connector = new Connector();
    await connector.connect();
    const games = connector.games();

    const query = {
        code: game_code,
        admin: admin_sub,
    };
    await games.deleteOne(query);
}