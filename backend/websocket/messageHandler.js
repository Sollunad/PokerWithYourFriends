const { startGame, adjustBlinds, setUsername } = require('../services/games/controller');

exports.handle = handleMessage;

async function handleMessage(message, game_code, user_id) {
    console.log(message);
    console.log(game_code);
    console.log(user_id);
    if (!message.action) return;
    switch (message.action) {
        case 'startGame': await startGame(game_code, user_id); return;
        case 'adjustBlinds': await adjustBlinds(game_code, user_id, message.blinds); return;
        case 'setUsername': await setUsername(game_code, user_id, message.name); return;
    }
}