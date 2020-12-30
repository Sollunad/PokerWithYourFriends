const { startGame, adjustBlinds, setUsername, updateChipsForUsername, deleteGame, joinGame } = require('../services/games/controller');
const { createTable, playMove, processAndClearTable, showCards } = require('../services/tables/controller');

exports.handle = handleMessage;

async function handleMessage(message, game_code, user_id) {
    if (!message.action) return;
    switch (message.action) {
        case 'startGame': await startGame(game_code, user_id); return;
        case 'joinLobby': await joinGame(game_code, user_id); return;
        case 'deleteGame': await deleteGame(game_code, user_id); return;
        case 'adjustBlinds': await adjustBlinds(game_code, user_id, message.blinds); return;
        case 'setUsername': await setUsername(game_code, user_id, message.name); return;
        case 'startRound': await createTable(game_code, user_id); return;
        case 'finishRound': await processAndClearTable(game_code, user_id); return;
        case 'playMove': await playMove(game_code, user_id, message.move, message.value); return;
        case 'showCards': await showCards(game_code, user_id); return;
        case 'saveChips': await updateChipsForUsername(game_code, user_id, message.user_name, message.chips); return;
    }
}