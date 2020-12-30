const { getGame, getAdminGame, updateChipsForPlayer, setRoundCounter, setNextDealer } = require('../games/controller');
const poker = require('../../node-poker/lib/node-poker');

exports.createTable = createTable;
exports.getTable = getTable;
exports.processAndClearTable = processAndClearTable;
exports.playMove = playMove;
exports.showCards = showCards;

let tables = [];

async function createTable(game_code, user_sub) {
    const beGame = await getAdminGame(game_code, user_sub);
    if (!beGame) return;
    if (getTable(game_code)) return;

    const livingPlayers = beGame.players.filter(p => p.chips > 0);
    if (livingPlayers.length === 1) return;

    let blindStepNum = Math.floor(beGame.rounds_played / beGame.blind_rules.raise_every_n_rounds);
    if (blindStepNum >= beGame.blind_rules.steps.length) blindStepNum = beGame.blind_rules.steps.length - 1;
    const blindStep = beGame.blind_rules.steps[blindStepNum];

    const next_dealer_user_id = beGame.players[beGame.next_dealer].user_id;
    let next_dealer_id;
    for (let i = 0; i < livingPlayers.length; i++) {
        if (livingPlayers[i].user_id === next_dealer_user_id) next_dealer_id = i;
    }
    const table = new poker.Table(game_code, blindStep.small, blindStep.big, next_dealer_id);
    for (const player of livingPlayers) {
        table.AddPlayer(player.user_id, player.chips);
    }
    table.StartGame();
    tables.push(table);
}

function getTable(game_code) {
    return tables.find(t => t.game_code === game_code);
}

async function processAndClearTable(game_code, user_sub) {
    const beGame = await getAdminGame(game_code, user_sub);
    if (!beGame) return;
    const table = getTable(game_code);
    if (!table || table.game.roundName !== 'Showdown') return;
    const livingPlayers = beGame.players.filter(p => p.chips > 0);
    for (const player of livingPlayers) {
        const table_player = table.players.find(p => p.playerName === player.user_id);
        let chips = 0;
        if (table_player) chips = table_player.chips;
        player.chips = chips;
        await updateChipsForPlayer(game_code, user_sub, player.user_id, chips);
    }

    const oldRounds = beGame.rounds_played;
    await setRoundCounter(game_code, user_sub, oldRounds + 1);

    const oldDealer = beGame.next_dealer;
    let newDealer = (oldDealer + 1) % beGame.players.length;
    while (beGame.players[newDealer].chips === 0) {
        newDealer = (newDealer + 1) % beGame.players.length;
    }
    await setNextDealer(game_code, user_sub, newDealer);

    tables = tables.filter(t => t.game_code !== game_code);
}

async function showCards(game_code, user_sub) {
    const beGame = await getGame(game_code);
    if (!beGame) return;
    const table = getTable(game_code);
    if (!table || table.game.roundName !== 'Showdown') return;
    const table_player = table.players.find(p => p.playerName === user_sub);
    if (table_player) table_player.showCards = true;
}

function playMove(game_code, user_sub, move, value) {
    const table = getTable(game_code);
    if (!table) return;

    const current_player = table.getCurrentPlayer();
    if (current_player !== user_sub) return;

    const player_object = table.players.find(p => p.playerName === user_sub);

    switch (move) {
        case 'fold': player_object.Fold(); return;
        case 'check': player_object.Check(); return;
        case 'call': player_object.Call(); return;
        case 'raise': player_object.Bet(value); return;
    }
}