exports.getFEGameState = getFEGameState;

function getFEGameState(beGame, table, user_id, clientsForGame) {
    return {
        players: beGame.players.map(bePlayer => getFEPlayer(bePlayer, beGame, table, user_id, clientsForGame)),
        board: table ? table.game.board : [],
        started: beGame.started,
        blind_rules: beGame.blind_rules,
        pot: table ? table.game.pot : 0,
        round_running: !!table,
    }
}

function getFEPlayer(bePlayer, beGame, table, user_id, clientsForGame) {
    const dealer_num = table ? table.dealer : 0;
    const players_in_game = beGame.players.filter(p => p.chips > 0);
    const sb_num = (dealer_num + 1) % players_in_game.length;
    const bb_num = (dealer_num + 2) % players_in_game.length;
    const table_player = table ? table.players.find(p => p.playerName === bePlayer.user_id) : undefined;
    const table_player_id = table_player ? table_player.playerId() : 0;
    return {
        name: bePlayer.name,
        is_self: bePlayer.user_id === user_id,
        is_turn: table ? bePlayer.user_id === table.getCurrentPlayer() : false,
        is_connected: clientsForGame.some(c => c.user_id === bePlayer.user_id),
        is_admin: bePlayer.user_id === beGame.admin,
        is_dealer: table ? bePlayer.user_id === players_in_game[dealer_num].user_id : false,
        is_bb: table ? bePlayer.user_id === players_in_game[bb_num].user_id : false,
        is_sb: table ? bePlayer.user_id === players_in_game[sb_num].user_id : false,
        is_round_winner: table ? table.gameWinners.some(w => w.playerName === bePlayer.user_id) : false,
        is_out: bePlayer.chips === 0,
        has_fold: table_player ? table_player.folded : false,
        cards: getPlayerCards(table_player, user_id),
        chips_bank: table_player ? table_player.chips : bePlayer.chips,
        chips_bet: table_player ? table.game.bets[table_player_id] : 0,
        chips_pot: table_player ? table.game.roundBets[table_player_id] : 0,
    }
}

function getPlayerCards(table_player, user_id) {
    if (!table_player) return [];
    if (table_player.playerName !== user_id) {
        return [
            { visible: false }, { visible: false}
        ];
    }
    return table_player.cards.map(card => {
        return {
            visible: true,
            value: card.charAt(0),
            suit: card.charAt(1),
        };
    });
}