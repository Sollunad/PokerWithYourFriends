const randomString = require('random-base64-string');
const { uniqueNamesGenerator, colors, animals, NumberDictionary } = require('unique-names-generator');

exports.newGame = getNewGame;
exports.newPlayer = getNewPlayer;
exports.getRandomPlayerName = getRandomPlayerName;

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
        player_count: 1,
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
        steps: [
            { small: 5, big: 10 },
            { small: 10, big: 20 },
            { small: 15, big: 30 },
            { small: 20, big: 40 },
            { small: 30, big: 60 },
            { small: 50, big: 100 },
            { small: 75, big: 150 },
            { small: 100, big: 200 },
            { small: 200, big: 400 },
            { small: 400, big: 800 },
        ],
        raise_every_n_rounds: 10,
    }
}

function getRandomPlayerName() {
    const animals11Letters = animals.filter(a => a.length <= 11);
    const numbers = NumberDictionary.generate({ min: 1000, max: 9999 });
    const config = {
        dictionaries: [animals11Letters, numbers],
        length: 2,
        separator: '',
        style: 'capital',
    };
    return uniqueNamesGenerator(config);
}