const randomString = require('random-base64-string');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

exports.newGame = getNewGame;
exports.newPlayer = getNewPlayer;

function getNewGame(creator_sub) {
    return {
        code: randomString(10).toUpperCase(),
        opened: new Date(),
        started: false,
        players: [ getNewPlayer(creator_sub) ],
        admin: creator_sub,
        next_dealer: 0,
        rounds_played: 0,
        blind_rules: getDefaultBlindRules(),
    }
}

function getNewPlayer(user_sub, chips = 1000) {
    return {
        user_id: user_sub,
        name: getRandomPlayerName(),
        chips,
    }
}

function getDefaultBlindRules() {
    return {
        small: [5, 10, 15, 20, 30, 50, 75, 100, 200, 400],
        big: [10, 20, 30, 40, 60, 100, 150, 200, 400, 800],
        raise_every_n_rounds: 10,
    }
}

function getRandomPlayerName() {
    const config = {
        dictionaries: [adjectives, colors, animals],
        separator: ' ',
        style: 'capital',
    };
    return uniqueNamesGenerator(config);
}