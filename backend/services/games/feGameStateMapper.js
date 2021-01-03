exports.getFEGameState = getFEGameState;

function getFEGameState(beGame, table, user_id, clientsForGame) {
    return {
        players: beGame.players.map(bePlayer => getFEPlayer(bePlayer, beGame, table, user_id, clientsForGame)),
        board: table ? getBoardCards(table.game.board) : [],
        started: beGame.started,
        blind_rules: beGame.blind_rules,
        pot: table ? table.game.pot : 0,
        round_running: !!table,
        round_finished: table ? !!table.gameWinners.length : false,
        min_raise: table ? table.minRaise : 0,
        event_list: table ? table.event_list.map(event => mapEvent(event, beGame)).reverse() : [],
        rounds_played: beGame.rounds_played,
    }
}

function getFEPlayer(bePlayer, beGame, table, user_id, clientsForGame) {
    const table_player = table ? table.players.find(p => p.playerName === bePlayer.user_id) : undefined;
    const table_player_id = table_player ? table_player.playerId() : 0;
    return {
        name: bePlayer.name,
        is_self: bePlayer.user_id === user_id,
        is_turn: table ? bePlayer.user_id === table.getCurrentPlayer() : false,
        is_connected: clientsForGame.some(c => c.user_id === bePlayer.user_id),
        is_admin: bePlayer.user_id === beGame.admin,
        is_dealer: table ? bePlayer.user_id === table.dealerPlayer.playerName : false,
        is_bb: table ? bePlayer.user_id === table.bigBlindPlayer.playerName : false,
        is_sb: table ? bePlayer.user_id === table.smallBlindPlayer.playerName : false,
        is_allIn: table_player ? table_player.allIn : false,
        is_round_winner: table ? table.gameWinners.some(w => w.playerName === bePlayer.user_id) : false,
        is_out: bePlayer.chips === 0,
        has_fold: table_player ? table_player.folded : false,
        shows_cards: table_player ? table_player.showCards : false,
        cards: getPlayerCards(table_player, user_id),
        chips_bank: table_player ? table_player.chips : bePlayer.chips,
        chips_bet: table_player ? table.game.bets[table_player_id] : 0,
        chips_pot: table_player ? table.game.roundBets[table_player_id] : 0,
        call_value: table_player ? table_player.getCallValue() : 0,
    }
}

function getPlayerCards(table_player, user_id) {
    if (!table_player) return [];
    if (table_player.playerName !== user_id && !table_player.showCards) {
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

function getBoardCards(table_cards) {
    if (!table_cards) return [];
    return table_cards.map(card => {
        return {
            visible: true,
            value: card.charAt(0),
            suit: card.charAt(1),
        };
    });
}

function mapEvent(event, beGame) {
    const username = event.user_id ? beGame.players.find(p => p.user_id === event.user_id).name : '';
    switch (event.event) {
        case 'smallBlind': return `${username} pays ${event.amount}$ as small blind.`;
        case 'bigBlind': return `${username} pays ${event.amount}$ as big blind.`;
        case 'fold': return `${username} folds.`;
        case 'check': return `${username} checks.`;
        case 'call': return `${username} calls.`;
        case 'raise': return `${username} raises with ${event.amount}$.`;
        case 'allIn': return `${username} goes All In with their remaining ${event.amount}$!`;
        case 'flop': return `--- Flop ---`;
        case 'turn': return `--- Turn ---`;
        case 'river': return `--- River ---`;
        case 'showdown': return `--- Showdown ---`;
        case 'winner': return `${username} wins ${event.amount}$${event.hand ? ` with their ${event.hand}` : ''}.`;
    }
}