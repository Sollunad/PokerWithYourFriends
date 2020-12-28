const { getAdminGame, updateChipsForPlayer } = require('../games/controller');
const poker = require('../../node-poker/lib/node-poker');

exports.createTable = createTable;
exports.getTable = getTable;
exports.processAndClearTable = processAndClearTable;

let tables = [];

async function createTable(game_code, user_sub) {
    const beGame = await getAdminGame(game_code, user_sub);
    if (!beGame) return;
    const livingPlayers = beGame.players.filter(p => p.chips > 0);
    const blindStepNum = Math.floor(beGame.rounds_played / beGame.blind_rules.raise_every_n_rounds);
    const blindStep = beGame.blind_rules.steps[blindStepNum];
    const table = new poker.Table(game_code, blindStep.small, blindStep.big, 0);
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
    if (table.game.roundName !== 'Showdown') return;

    const livingPlayers = beGame.players.filter(p => p.chips > 0);
    for (const player of livingPlayers) {
        const table_player = table.players.find(p => p.playerName === player.user_id);
        let chips = 0;
        if (table_player) chips = table_player.chips;
        await updateChipsForPlayer(game_code, user_sub, player.user_id, chips);
    }

    // TODO Round counter 1 hoch
    // TODO Dealer 1 hoch mod players, ausgeschiedene überspringen

    tables = tables.filter(t => t.game_code !== game_code);
}