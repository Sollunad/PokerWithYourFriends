var events = require('events');
const _rankHands = require('./rank-hands');

function Table(smallBlind, bigBlind, minPlayers, maxPlayers, minBuyIn, maxBuyIn) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.players = [];
    this.dealer = 0; //Track the dealer position between games
    this.minBuyIn = minBuyIn;
    this.maxBuyIn = maxBuyIn;
    this.playersToRemove = [];
    this.playersToAdd = [];
    this.eventEmitter = new events.EventEmitter();
    this.lastAction = {};
    this.gameWinners = [];
    this.gameLosers = [];

    //Validate acceptable value ranges.
    var err;
    if (minPlayers < 2) { //require at least two players to start a game.
        err = new Error(101, 'Parameter [minPlayers] must be a postive integer of a minimum value of 2.');
    } else if (maxPlayers > 10) { //hard limit of 10 players at a table.
        err = new Error(102, 'Parameter [maxPlayers] must be a positive integer less than or equal to 10.');
    } else if (minPlayers > maxPlayers) { //Without this we can never start a game!
        err = new Error(103, 'Parameter [minPlayers] must be less than or equal to [maxPlayers].');
    }

    if (err) {
        return err;
    }
}

function Player(playerName, chips, table) {
    this.playerName = playerName;
    this.chips = chips;
    this.folded = false;
    this.allIn = false;
    this.talked = false;
    this.table = table; //Circular reference to allow reference back to parent object.
    this.cards = [];
    this.playerId = () => {
        for (let i = 0; i < this.table.players.length; i += 1) {
            if (this === this.table.players[i]) {
                return i;
            }
        }
    }
}

function fillDeck(deck) {
    deck.push('AS');
    deck.push('KS');
    deck.push('QS');
    deck.push('JS');
    deck.push('TS');
    deck.push('9S');
    deck.push('8S');
    deck.push('7S');
    deck.push('6S');
    deck.push('5S');
    deck.push('4S');
    deck.push('3S');
    deck.push('2S');
    deck.push('AH');
    deck.push('KH');
    deck.push('QH');
    deck.push('JH');
    deck.push('TH');
    deck.push('9H');
    deck.push('8H');
    deck.push('7H');
    deck.push('6H');
    deck.push('5H');
    deck.push('4H');
    deck.push('3H');
    deck.push('2H');
    deck.push('AD');
    deck.push('KD');
    deck.push('QD');
    deck.push('JD');
    deck.push('TD');
    deck.push('9D');
    deck.push('8D');
    deck.push('7D');
    deck.push('6D');
    deck.push('5D');
    deck.push('4D');
    deck.push('3D');
    deck.push('2D');
    deck.push('AC');
    deck.push('KC');
    deck.push('QC');
    deck.push('JC');
    deck.push('TC');
    deck.push('9C');
    deck.push('8C');
    deck.push('7C');
    deck.push('6C');
    deck.push('5C');
    deck.push('4C');
    deck.push('3C');
    deck.push('2C');

    //Shuffle the deck array with Fisher-Yates
    var i, j, tempi, tempj;
    for (i = 0; i < deck.length; i += 1) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = deck[i];
        tempj = deck[j];
        deck[i] = tempj;
        deck[j] = tempi;
    }
}

function getMaxBet(bets) {
    var maxBet, i;
    maxBet = 0;
    for (i = 0; i < bets.length; i += 1) {
        if (bets[i] > maxBet) {
            maxBet = bets[i];
        }
    }
    return maxBet;
}

function checkForEndOfRound(table) {
    var maxBet, i, endOfRound;
    endOfRound = true;
    maxBet = getMaxBet(table.game.bets);
    //For each player, check
    for (i = 0; i < table.players.length; i += 1) {
        if (table.players[i].folded === false) {
            if (table.players[i].talked === false || table.game.bets[i] !== maxBet) {
                if (table.players[i].allIn === false) {
                    endOfRound = false;
                }
            }
        }
    }
    return endOfRound;
}

function checkForAllInPlayer(table, winners) {
    var i, allInPlayer;
    allInPlayer = [];
    for (i = 0; i < winners.length; i += 1) {
        if (table.players[winners[i]].allIn === true) {
            allInPlayer.push(winners[i]);
        }
    }
    return allInPlayer;
}

function checkForWinner(table) {
    var i, j, k, l, maxRank, winners, part, prize, allInPlayer, minBets, roundEnd;
    //Identify winner(s)
    winners = [];
    maxRank = 0.000;
    for (k = 0; k < table.players.length; k += 1) {
        if (table.players[k].hand.rank === maxRank && table.players[k].folded === false) {
            winners.push(k);
        }
        if (table.players[k].hand.rank > maxRank && table.players[k].folded === false) {
            maxRank = table.players[k].hand.rank;
            winners.splice(0, winners.length);
            winners.push(k);
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
            table.gameLosers.push(table.players[i]);
            console.log('player ' + table.players[i].playerName + ' is going bankrupt');
            table.players.splice(i, 1);
        }
    }
}

function Hand(cards) {
    this.cards = cards;
}

function progress(table) {
    table.eventEmitter.emit("turn");
    var i, j, cards, hand;
    if (table.game) {
        if (checkForEndOfRound(table) === true) {
            table.setCurrentPlayerForNewRound();
            //Move all bets to the pot
            for (i = 0; i < table.game.bets.length; i += 1) {
                table.game.pot += parseInt(table.game.bets[i], 10);
                table.game.roundBets[i] += parseInt(table.game.bets[i], 10);
            }
            if (table.game.roundName === 'River') {
                table.game.roundName = 'Showdown';
                table.game.bets.splice(0, table.game.bets.length);
                //Evaluate each hand
                for (j = 0; j < table.players.length; j += 1) {
                    cards = table.players[j].cards.concat(table.game.board);
                    hand = new Hand(cards);
                    table.players[j].hand = _rankHands.rankHand(hand);
                }
                checkForWinner(table);
                checkForBankrupt(table);
                table.eventEmitter.emit("gameOver");
            } else if (table.game.roundName === 'Turn') {
                console.log('effective turn');
                table.game.roundName = 'River';
                table.game.deck.pop(); //Burn a card
                table.game.board.push(table.game.deck.pop()); //Turn a card
                //table.game.bets.splice(0,table.game.bets.length-1);
                for (i = 0; i < table.game.bets.length; i += 1) {
                    table.game.bets[i] = 0;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    table.players[i].talked = false;
                }
                table.eventEmitter.emit("deal");
            } else if (table.game.roundName === 'Flop') {
                console.log('effective flop');
                table.game.roundName = 'Turn';
                table.game.deck.pop(); //Burn a card
                table.game.board.push(table.game.deck.pop()); //Turn a card
                for (i = 0; i < table.game.bets.length; i += 1) {
                    table.game.bets[i] = 0;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    table.players[i].talked = false;
                }
                table.eventEmitter.emit("deal");
            } else if (table.game.roundName === 'Deal') {
                console.log('effective deal');
                table.game.roundName = 'Flop';
                table.game.deck.pop(); //Burn a card
                for (i = 0; i < 3; i += 1) { //Turn three cards
                    table.game.board.push(table.game.deck.pop());
                }
                //table.game.bets.splice(0,table.game.bets.length-1);
                for (i = 0; i < table.game.bets.length; i += 1) {
                    table.game.bets[i] = 0;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    table.players[i].talked = false;
                }
                table.eventEmitter.emit("deal");
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

/*
 * Helper Methods Public
 */
// newRound helper
Table.prototype.getHandForPlayerName = function (playerName) {
    for (var i in this.players) {
        if (this.players[i].playerName === playerName) {
            return this.players[i].cards;
        }
    }
    return [];
};
Table.prototype.getDeal = function () {
    return this.game.board;
};
Table.prototype.getEventEmitter = function () {
    return this.eventEmitter;
};
Table.prototype.getCurrentPlayer = function () {
    return this.players[this.currentPlayer].playerName;
};
Table.prototype.getPreviousPlayerAction = function () {
    return this.lastAction;
};
Table.prototype.getWinners = function () {
    return this.gameWinners;
};
Table.prototype.getLosers = function () {
    return this.gameLosers;
};

Table.prototype.initNewRound = function () {
    var i;
    this.dealer += 1;
    if (this.dealer >= this.players.length) {
        this.dealer = 0;
    }
    this.game.pot = 0;
    this.game.roundName = 'Deal'; //Start the first round
    this.game.bets.splice(0, this.game.bets.length);
    this.game.deck.splice(0, this.game.deck.length);
    this.game.board.splice(0, this.game.board.length);
    for (i = 0; i < this.players.length; i += 1) {
        this.players[i].folded = false;
        this.players[i].talked = false;
        this.players[i].allIn = false;
        this.players[i].cards.splice(0, this.players[i].cards.length);
    }
    fillDeck(this.game.deck);
    this.NewRound();
};

Table.prototype.StartGame = function () {
    //If there is no current game and we have enough players, start a new game.
    if (!this.game) {
        this.game = new Game(this.smallBlind, this.bigBlind);
        this.NewRound();
    }
};

Table.prototype.AddPlayer = function (playerName, chips) {
    if (chips >= this.minBuyIn && chips <= this.maxBuyIn) {
        var player = new Player(playerName, chips, this);
        this.playersToAdd.push(player);
    }
};
Table.prototype.removePlayer = function (playerName) {
    for (var i in this.players) {
        if (this.players[i].playerName === playerName) {
            this.playersToRemove.push(i);
            this.players[i].Fold();
        }
    }
    for (var i in this.playersToAdd) {
        if (this.playersToAdd[i].playerName === playerName) {
            this.playersToAdd.splice(i, 1);
        }
    }
}
Table.prototype.NewRound = function () {
    // Add players in waiting list
    var removeIndex = 0;
    for (var i in this.playersToAdd) {
        if (removeIndex < this.playersToRemove.length) {
            var index = this.playersToRemove[removeIndex];
            this.players[index] = this.playersToAdd[i];
            removeIndex += 1;
        } else {
            this.players.push(this.playersToAdd[i]);
        }
    }
    this.playersToRemove = [];
    this.playersToAdd = [];
    this.gameWinners = [];
    this.gameLosers = [];


    //Deal 2 cards to each player
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

    this.eventEmitter.emit("newRound");
};

Table.prototype.setCurrentPlayerForNewRound = function () {
    this.currentPlayer = (this.dealer + 3) % this.players.length;
    while (this.players[this.currentPlayer].folded || this.players[this.currentPlayer].allIn) {
        this.currentPlayer = this.currentPlayer + 1 % this.players.length;
    }
}

Table.prototype.moveCurrentPlayerForward = function () {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;

    console.log(this.players.length);
    console.log(this.currentPlayer);
    while (this.players[this.currentPlayer].folded || this.players[this.currentPlayer].allIn) {
        this.currentPlayer = this.currentPlayer + 1 % this.players.length;
    }
}

Player.prototype.GetChips = function (cash) {
    this.chips += cash;
};

Player.prototype.Check = function () {
    var checkAllow, v, i;
    checkAllow = true;
    for (v = 0; v < this.table.game.bets.length; v += 1) {
        //TODO: Big Blind kann nicht checken
        if (this.table.game.bets[v] !== 0) {
            checkAllow = false;
        }
    }
    if (checkAllow) {
        this.talked = true;
        //Attemp to progress the game
        this.lastAction = {action: "check", playerName: this.playerName};
        progress(this.table);
    } else {
        console.log("Check not allowed, replay please");
    }
};

Player.prototype.Fold = function () {
    var i, bet;
    //Move any current bet into the pot
    for (i = 0; i < this.table.players.length; i += 1) {
        if (this === this.table.players[i]) {
            bet = parseInt(this.table.game.bets[i], 10);
            this.table.game.bets[i] = 0;
            this.table.game.pot += bet;
            this.talked = true;
        }
    }
    //Mark the player as folded
    this.folded = true;
    this.lastAction = {action: "fold", playerName: this.playerName};

    //Attemp to progress the game
    progress(this.table);
};

Player.prototype.Bet = function (bet) {
    const maxBet = getMaxBet(this.table.game.bets);
    const diffBet = maxBet + bet - this.table.game.bets[this.playerId()];
    if (this.chips > diffBet) {
        this.table.game.bets[this.playerId()] += diffBet;
        this.chips -= diffBet;
        this.talked = true;
        this.lastAction = {action: "raise", playerName: this.playerName, amount: bet};
        progress(this.table);
    } else {
        console.log('ALL IN !!!');
        this.AllIn();
    }
};

Player.prototype.Call = function () {
    const maxBet = getMaxBet(this.table.game.bets);
    const diffBet = maxBet - this.table.game.bets[this.playerId()];
    if (this.chips > diffBet) {
        this.table.game.bets[this.playerId()] += diffBet;
        this.chips -= diffBet;
        this.talked = true;
        this.lastAction = {action: "call", playerName: this.playerName, amount: diffBet};
        progress(this.table);
    } else {
        console.log('ALL IN !!!');
        this.AllIn();
    }
};

Player.prototype.AllIn = function () {
    var i, allInValue = 0;
    for (i = 0; i < this.table.players.length; i += 1) {
        if (this === this.table.players[i]) {
            if (this.table.players[i].chips !== 0) {
                allInValue = this.table.players[i].chips;
                this.table.game.bets[i] += this.table.players[i].chips;
                this.table.players[i].chips = 0;

                this.allIn = true;
                this.talked = true;
            }
        }
    }

    //Attemp to progress the game
    this.lastAction = {action: "allin", playerName: this.playerName, amount: allInValue};
    progress(this.table);
};


exports.Table = Table;
