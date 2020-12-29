var events = require("events");
const _rankHands = require("./rank-hands");

function Table(game_code, smallBlind, bigBlind, dealer) {
  this.game_code = game_code;
  this.smallBlind = smallBlind;
  this.bigBlind = bigBlind;
  this.minRaise = bigBlind;
  this.players = [];
  this.dealer = dealer;
  this.gameWinners = [];
  this.event_list = [];
}

function Player(playerName, chips, table) {
  this.playerName = playerName;
  this.chips = chips;
  this.folded = false;
  this.allIn = false;
  this.talked = false;
  this.showCards = false;
  this.table = table;
  this.cards = [];
}

function Hand(cards) {
  this.cards = cards;
}

function fillDeck(deck) {
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A",
  ];
  const suits = ["D", "H", "S", "C"];
  for (const value of values) {
    for (const suit of suits) {
      deck.push(`${value}${suit}`);
    }
  }
  deck.sort(() => Math.random() - 0.5);
}

function checkForEndOfRound(table) {
  const maxBet = table.getMaxBet();
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

function checkForAllInPlayers(table, winners) {
  const allInPlayers = [];
  for (let i = 0; i < winners.length; i += 1) {
    if (table.players[winners[i]].allIn === true) {
      allInPlayers.push(winners[i]);
    }
  }
  return allInPlayers;
}

function checkForWinner(table) {
  //Identify winner(s)
  let winners = [];
  let maxRank = 0.0;
  let countPlayersIngame = 0;
  for (let playerId = 0; playerId < table.players.length; playerId++) {
    if (table.players[playerId].folded || table.game.roundBets[playerId] === 0) continue;
    countPlayersIngame++;
    const cards = table.players[playerId].cards.concat(table.game.board);
    const hand = new Hand(cards);
    table.players[playerId].hand = _rankHands.rankHand(hand);
    if (table.players[playerId].hand.rank === maxRank) {
      winners.push(playerId);
    } else if (table.players[playerId].hand.rank > maxRank) {
      maxRank = table.players[playerId].hand.rank;
      winners = [];
      winners.push(playerId);
    }
  }

  let minBet = table.game.roundBets[winners[0]];
  const allInPlayers = checkForAllInPlayers(table, winners);
  if (allInPlayers.length > 0) {
    for (let i = 1; i < allInPlayers.length; i++) {
      if (table.game.roundBets[winners[i]] < minBet) {
        minBet = table.game.roundBets[winners[i]];
      }
    }
  }

  let prize = 0;
  for (let i = 0; i < table.game.roundBets.length; i++) {
    if (table.game.roundBets[i] > minBet) {
      prize += minBet;
      table.game.roundBets[i] -= minBet;
    } else {
      prize += table.game.roundBets[i];
      table.game.roundBets[i] = 0;
    }
  }

  // TODO runden auf ganze Chips?
  for (let i = 0; i < winners.length; i++) {
    const winnerPrize = prize / winners.length;
    const winningPlayer = table.players[winners[i]];
    winningPlayer.chips += winnerPrize;
    if (countPlayersIngame > 1) winningPlayer.showCards = true;
    const pushedGameWinner = table.gameWinners.find(
      (w) => w.playerName === winningPlayer.playerName
    );
    if (pushedGameWinner) {
      pushedGameWinner.amount += winnerPrize;
      pushedGameWinner.chips = winningPlayer.chips;
    } else {
      table.gameWinners.push({
        playerName: winningPlayer.playerName,
        amount: winnerPrize,
        hand: winningPlayer.hand,
        chips: winningPlayer.chips,
      });
    }
  }

  for (const gameWinner of table.gameWinners) {
    table.event_list.push({
      event: 'winner',
      user_id: gameWinner.playerName,
      amount: gameWinner.amount,
      hand: countPlayersIngame > 1 ? gameWinner.hand.message : undefined,
    });
  }

  let roundEnd = true;
  for (let i = 0; i < table.game.roundBets.length; i++) {
    if (table.game.roundBets[i] !== 0) {
      roundEnd = false;
    }
  }
  if (!roundEnd) {
    checkForWinner(table);
  }
}

function moveBetsToPot(table) {
  for (let i = 0; i < table.game.bets.length; i += 1) {
    table.game.pot += parseInt(table.game.bets[i], 10);
    table.game.roundBets[i] += parseInt(table.game.bets[i], 10);
    table.game.bets[i] = 0;
  }
}

function progress(table) {
  if (table.game) {
    const actablePlayers = table.players.filter((p) => !p.folded && !p.allIn);
    const maxBet = table.getMaxBet();
    if (actablePlayers.length === 0
        || (actablePlayers.length === 1 && table.game.bets[actablePlayers[0].playerId()] === maxBet)) {
      let cardsToTurn;
      switch (table.game.roundName) {
        case "Deal":
          cardsToTurn = 5;
          break;
        case "Flop":
          cardsToTurn = 2;
          break;
        case "Turn":
          cardsToTurn = 1;
          break;
        default:
          cardsToTurn = 0;
      }
      for (let i = 0; i < cardsToTurn; i++) {
        table.game.board.push(table.game.deck.pop());
      }
      moveBetsToPot(table);
      table.game.roundName = "Showdown";
      table.event_list.push({event: 'showdown'});
      table.currentPlayer = -1;
      checkForWinner(table);
    } else if (checkForEndOfRound(table) === true) {
      table.setCurrentPlayerForNewRound();
      table.minRaise = table.bigBlind;
      moveBetsToPot(table);

      for (const player of table.players) {
        player.talked = false;
      }

      if (table.game.roundName === "River") {
        table.game.roundName = "Showdown";
        table.event_list.push({event: 'showdown'});
        table.currentPlayer = -1;
        checkForWinner(table);
      } else if (table.game.roundName === "Turn") {
        table.game.roundName = "River";
        table.event_list.push({event: 'river'});
        table.game.deck.pop(); //Burn a card
        table.game.board.push(table.game.deck.pop()); //Turn a card
      } else if (table.game.roundName === "Flop") {
        table.game.roundName = "Turn";
        table.event_list.push({event: 'turn'});
        table.game.deck.pop(); //Burn a card
        table.game.board.push(table.game.deck.pop()); //Turn a card
      } else if (table.game.roundName === "Deal") {
        table.game.roundName = "Flop";
        table.event_list.push({event: 'flop'});
        table.game.deck.pop(); //Burn a card
        for (let i = 0; i < 3; i += 1) {
          //Turn three cards
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
  this.roundName = "Deal"; //Start the first round
  this.bets = [];
  this.roundBets = [];
  this.deck = [];
  this.board = [];
  fillDeck(this.deck);
}

Table.prototype.getCurrentPlayer = function () {
  if (this.currentPlayer === -1) return "";
  return this.players[this.currentPlayer].playerName;
};

Table.prototype.StartGame = function () {
  this.game = new Game(this.smallBlind, this.bigBlind);
  // Deal cards
  for (let i = 0; i < this.players.length; i += 1) {
    this.players[i].cards.push(this.game.deck.pop());
    this.players[i].cards.push(this.game.deck.pop());
    this.game.bets[i] = 0;
    this.game.roundBets[i] = 0;
  }

  // Identify Small and Big Blind player indexes
  const smallBlind = (this.dealer + 1) % this.players.length;
  const bigBlind = (this.dealer + 2) % this.players.length;

  // Force Blind Bets
  if (this.players[smallBlind].chips <= this.smallBlind) {
    this.game.bets[smallBlind] = this.players[smallBlind].chips;
    this.players[smallBlind].chips = 0;
    this.players[smallBlind].allIn = true;
  } else {
    this.players[smallBlind].chips -= this.smallBlind;
    this.game.bets[smallBlind] = this.smallBlind;
  }
  this.event_list.push({
    user_id: this.players[smallBlind].playerName,
    event: 'smallBlind',
    amount: this.game.bets[smallBlind],
  });

  if (this.players[bigBlind].chips <= this.bigBlind) {
    this.game.bets[bigBlind] = this.players[bigBlind].chips;
    this.players[bigBlind].chips = 0;
    this.players[bigBlind].allIn = true;
  } else {
    this.players[bigBlind].chips -= this.bigBlind;
    this.game.bets[bigBlind] = this.bigBlind;
  }

  this.event_list.push({
    user_id: this.players[bigBlind].playerName,
    event: 'bigBlind',
    amount: this.game.bets[bigBlind],
  });

  // get currentPlayer
  this.setCurrentPlayerForNewRound();
};

Table.prototype.AddPlayer = function (playerName, chips) {
  const player = new Player(playerName, chips, this);
  this.players.push(player);
};

Table.prototype.setCurrentPlayerForNewRound = function () {
  this.currentPlayer = (this.dealer + 3) % this.players.length;
  while (
    this.players[this.currentPlayer].folded ||
    this.players[this.currentPlayer].allIn
  ) {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }
};

Table.prototype.moveCurrentPlayerForward = function () {
  this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  while (
    this.players[this.currentPlayer].folded ||
    this.players[this.currentPlayer].allIn
  ) {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }
};

Table.prototype.getMaxBet = function () {
  let maxBet = 0;
  for (let i = 0; i < this.game.bets.length; i += 1) {
    if (this.game.bets[i] > maxBet) {
      maxBet = this.game.bets[i];
    }
  }
  return maxBet;
};

Player.prototype.playerId = function () {
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
    this.table.event_list.push({
      event: 'check',
      user_id: this.playerName,
    });
    progress(this.table);
  } else {
    console.log("Check not allowed, replay please");
  }
};

Player.prototype.Fold = function () {
  //Move any current bet into the pot
  const bet = parseInt(this.table.game.bets[this.playerId()], 10);
  this.table.game.roundBets[this.playerId()] += bet;
  this.table.game.bets[this.playerId()] = 0;
  this.table.game.pot += bet;
  this.talked = true;
  this.folded = true;
  this.table.event_list.push({
    event: 'fold',
    user_id: this.playerName,
  });
  progress(this.table);
};

Player.prototype.Bet = function (bet) {
  const diffBet = this.getCallValue() + bet;
  if (this.chips > diffBet) {
    if (bet < this.table.minRaise) return;
    this.table.minRaise = bet;
    this.table.game.bets[this.playerId()] += diffBet;
    this.chips -= diffBet;
    this.talked = true;
    this.table.event_list.push({
      event: 'raise',
      user_id: this.playerName,
      amount: bet,
    });
    progress(this.table);
  } else {
    if (this.chips > this.getCallValue()) {
      const raiseValue = this.chips - this.getCallValue();
      if (raiseValue > this.table.minRaise) this.table.minRaise = raiseValue;
    }
    this.AllIn();
  }
};

Player.prototype.Call = function () {
  const diffBet = this.getCallValue();
  if (this.chips > diffBet) {
    this.table.game.bets[this.playerId()] += diffBet;
    this.chips -= diffBet;
    this.talked = true;
    this.table.event_list.push({
      event: 'call',
      user_id: this.playerName,
    });
    progress(this.table);
  } else {
    this.AllIn();
  }
};

Player.prototype.getCallValue = function () {
  const maxBet = this.table.getMaxBet();
  return maxBet - this.table.game.bets[this.playerId()];
};

Player.prototype.AllIn = function () {
  const allInValue = this.chips;
  this.table.game.bets[this.playerId()] += allInValue;
  this.chips = 0;
  this.allIn = true;
  this.talked = true;
  this.table.event_list.push({
    event: 'allIn',
    user_id: this.playerName,
  });
  progress(this.table);
};

exports.Table = Table;
