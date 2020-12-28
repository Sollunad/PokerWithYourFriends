var events = require('events');
const _rankHands = require('./rank-hands');

function Table(game_code, smallBlind, bigBlind, dealer) {
    this.game_code = game_code;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.minRaise = bigBlind;
    this.players = [];
    this.dealer = dealer;
    this.gameWinners = [];
}

function Player(playerName, chips, table) {
    this.playerName = playerName;
    this.chips = chips;
    this.folded = false;
    this.allIn = false;
    this.talked = false;
    this.table = table;
    this.cards = [];
}

function fillDeck(deck) {
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const suits = ['D', 'H', 'S', 'C'];
    for (const value of values) {
        for (const suit of suits) {
            deck.push(`${value}${suit}`);
        }
    }
    deck.sort(() => Math.random() - 0.5);
}

function getMaxBet(bets) {
    let maxBet = 0;
    for (let i = 0; i < bets.length; i += 1) {
        if (bets[i] > maxBet) {
            maxBet = bets[i];
        }
    }
    return maxBet;
}

function checkForEndOfRound(table) {
    const maxBet = getMaxBet(table.game.bets);
    for (let i = 0; i < table.players.length; i += 1) {
        if (table.players[i].folded === false) {
            if (table.players[i].talked === false || table.game.bets[i] !== maxBet) {
                if (table.players[i].allIn === false) {
                    return false;
                }
            }
        }
    }
    return true;
}

function checkForAllInPlayer(table, winners) {
    const allInPlayer = [];
    for (let i = 0; i < winners.length; i += 1) {
        if (table.players[winners[i]].allIn === true) {
            allInPlayer.push(winners[i]);
        }
    }
    return allInPlayer;
}

function checkForWinner(table) {
    var i, j, l, maxRank, part, prize, allInPlayer, minBets, roundEnd;
    //Identify winner(s)
    let winners = [];
    maxRank = 0.000;
    for (let playerId = 0; playerId < table.players.length; playerId++) {
        if (table.players[playerId].folded) continue;
        if (table.players[playerId].hand.rank === maxRank) {
            winners.push(playerId);
        } else if (table.players[playerId].hand.rank > maxRank) {
            maxRank = table.players[playerId].hand.rank;
            winners = [];
            winners.push(playerId);
        }
    }

    part = 0;
    prize = 0;
    allInPlayer = checkForAllInPlayer(table, winners);
    if (allInPlayer.length > 0) {
        minBets = table.game.roundBets[winners[0]];
        for (j = 1; j < allInPlayer.length; j += 1) {
            if (table.game.roundBets[winners[j]] !== 0 && table.game.roundBets[winners[j]] < minBets) {
                minBets = table.game.roundBets[winners[j]];
            }
        }
        part = parseInt(minBets, 10);
    } else {
        part = parseInt(table.game.roundBets[winners[0]], 10);

    }
    for (l = 0; l < table.game.roundBets.length; l += 1) {
        if (table.game.roundBets[l] > part) {
            prize += part;
            table.game.roundBets[l] -= part;
        } else {
            prize += table.game.roundBets[l];
            table.game.roundBets[l] = 0;
        }
    }

    for (i = 0; i < winners.length; i += 1) {
        var winnerPrize = prize / winners.length;
        var winningPlayer = table.players[winners[i]];
        winningPlayer.chips += winnerPrize;
        if (table.game.roundBets[winners[i]] === 0) {
            winningPlayer.folded = true;
            table.gameWinners.push({
                playerName: winningPlayer.playerName,
                amount: winnerPrize,
                hand: winningPlayer.hand,
                chips: winningPlayer.chips
            });
        }
        console.log('player ' + table.players[winners[i]].playerName + ' wins !!');
    }

    roundEnd = true;
    for (l = 0; l < table.game.roundBets.length; l += 1) {
        if (table.game.roundBets[l] !== 0) {
            roundEnd = false;
        }
    }
    if (roundEnd === false) {
        checkForWinner(table);
    }
}

function checkForBankrupt(table) {
    var i;
    for (i = 0; i < table.players.length; i += 1) {
        if (table.players[i].chips === 0) {
            console.log('player ' + table.players[i].playerName + ' is going bankrupt');
            table.players.splice(i, 1);
        }
    }
}

function Hand(cards) {
    this.cards = cards;
}

function progress(table) {
    var i, j, cards, hand;
    if (table.game) {
        if (checkForEndOfRound(table) === true) {
            table.setCurrentPlayerForNewRound();
            //Move all bets to the pot
            for (i = 0; i < table.game.bets.length; i += 1) {
                table.game.pot += parseInt(table.game.bets[i], 10);
                table.game.roundBets[i] += parseInt(table.game.bets[i], 10);
                table.game.bets[i] = 0;
            }

            for (const player of table.players) {
                player.talked = false;
            }

            if (table.game.roundName === 'River') {
                table.game.roundName = 'Showdown';
                this.currentPlayer = -1;
                //Evaluate each hand
                for (j = 0; j < table.players.length; j += 1) {
                    cards = table.players[j].cards.concat(table.game.board);
                    hand = new Hand(cards);
                    table.players[j].hand = _rankHands.rankHand(hand);
                }
                checkForWinner(table);
            } else if (table.game.roundName === 'Turn') {
                table.game.roundName = 'River';
                table.game.deck.pop(); //Burn a card
                table.game.board.push(table.game.deck.pop()); //Turn a card
            } else if (table.game.roundName === 'Flop') {
                table.game.roundName = 'Turn';
                table.game.deck.pop(); //Burn a card
                table.game.board.push(table.game.deck.pop()); //Turn a card
            } else if (table.game.roundName === 'Deal') {
                table.game.roundName = 'Flop';
                table.game.deck.pop(); //Burn a card
                for (i = 0; i < 3; i += 1) { //Turn three cards
                    table.game.board.push(table.game.deck.pop());
                }
            }
        } else {
            table.moveCurrentPlayerForward();
        }
    }
}

function Game(smallBlind, bigBlind) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.pot = 0;
    this.roundName = 'Deal'; //Start the first round
    this.bets = [];
    this.roundBets = [];
    this.deck = [];
    this.board = [];
    fillDeck(this.deck);
}

Table.prototype.getCurrentPlayer = function () {
    if (this.currentPlayer === -1) return '';
    return this.players[this.currentPlayer].playerName;
};

Table.prototype.StartGame = function () {
    this.game = new Game(this.smallBlind, this.bigBlind);
    for (let i = 0; i < this.players.length; i += 1) {
        this.players[i].cards.push(this.game.deck.pop());
        this.players[i].cards.push(this.game.deck.pop());
        this.game.bets[i] = 0;
        this.game.roundBets[i] = 0;
    }
    //Identify Small and Big Blind player indexes
    const smallBlind = (this.dealer + 1) % this.players.length;
    const bigBlind = (this.dealer + 2) % this.players.length;

    //Force Blind Bets
    //TODO Check for Allin
    this.players[smallBlind].chips -= this.smallBlind;
    this.players[bigBlind].chips -= this.bigBlind;
    this.game.bets[smallBlind] = this.smallBlind;
    this.game.bets[bigBlind] = this.bigBlind;

    // get currentPlayer
    this.setCurrentPlayerForNewRound();
};

Table.prototype.AddPlayer = function (playerName, chips) {
    const player = new Player(playerName, chips, this);
    this.players.push(player);
};

Table.prototype.setCurrentPlayerForNewRound = function () {
    this.currentPlayer = (this.dealer + 3) % this.players.length;
    while (this.players[this.currentPlayer].folded || this.players[this.currentPlayer].allIn) {
        this.currentPlayer = this.currentPlayer + 1 % this.players.length;
    }
}

Table.prototype.moveCurrentPlayerForward = function () {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    while (this.players[this.currentPlayer].folded || this.players[this.currentPlayer].allIn) {
        this.currentPlayer = this.currentPlayer + 1 % this.players.length;
    }
};

Table.prototype.getMaxBet = function() {
    let maxBet = 0;
    for (let i = 0; i < this.game.bets.length; i += 1) {
        if (this.game.bets[i] > maxBet) {
            maxBet = this.game.bets[i];
        }
    }
    return maxBet;
}

Player.prototype.playerId = function() {
    for (let i = 0; i < this.table.players.length; i += 1) {
        if (this === this.table.players[i]) {
            return i;
        }
    }
};

Player.prototype.Check = function () {
    const maxBet = this.table.getMaxBet();
    const ownBet = this.table.game.bets[this.playerId()];
    if (maxBet === ownBet) {
        this.talked = true;
        progress(this.table);
    } else {
        console.log("Check not allowed, replay please");
    }
};

Player.prototype.Fold = function () {
    //Move any current bet into the pot
    const bet = parseInt(this.table.game.bets[this.playerId()], 10);
    this.table.game.bets[this.playerId()] = 0;
    this.table.game.pot += bet;
    this.talked = true;
    //Mark the player as folded
    this.folded = true;
    progress(this.table);
};

Player.prototype.Bet = function (bet) {
    if (bet < this.table.minRaise) return;
    const maxBet = this.table.getMaxBet();
    const diffBet = maxBet + bet - this.table.game.bets[this.playerId()];
    if (this.chips > diffBet) {
        this.table.minRaise = bet;
        this.table.game.bets[this.playerId()] += diffBet;
        this.chips -= diffBet;
        this.talked = true;
        progress(this.table);
    } else {
        //TODO minRaise anpassen
        console.log('ALL IN !!!');
        this.AllIn();
    }
};

Player.prototype.Call = function () {
    console.log('call');
    const diffBet = this.getCallValue();
    if (this.chips > diffBet) {
        this.table.game.bets[this.playerId()] += diffBet;
        this.chips -= diffBet;
        this.talked = true;
        progress(this.table);
    } else {
        console.log('ALL IN !!!');
        this.AllIn();
    }
};

Player.prototype.getCallValue = function() {
    const maxBet = this.table.getMaxBet();
    return maxBet - this.table.game.bets[this.playerId()];
};

Player.prototype.AllIn = function () {
    const allInValue = this.table.players[this.playerId()].chips;
    this.table.game.bets[this.playerId()] += allInValue;
    this.table.players[this.playerId()].chips = 0;

    this.allIn = true;
    this.talked = true;
    progress(this.table);
};

exports.Table = Table;
